use std::collections::{HashMap, VecDeque};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
 
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use tauri_plugin_shell::process::{Command, CommandEvent};
use tauri_plugin_shell::ShellExt;

use crate::utils::progress_event::emit_progress;

const PYTHON_VERSION: &str = "3.14";
const NODEBLOCKS_WHEEL_URL: &str =
    "https://github.com/yDewolf/nodeblocks-server/releases/download/v0.2.0-beta/nodeblocks-0.2.0-py3-none-any.whl";
const PROGRESS_EVENT: &str = "env-setup-progress";


#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
enum InstallStep {
    NotStarted,
    VenvCreated,
    Completed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct InstallState {
    step: InstallStep,
}

impl Default for InstallState {
    fn default() -> Self {
        Self { step: InstallStep::NotStarted }
    }
}


#[derive(Default)]
pub struct SetupGuard(AtomicBool);
 
struct SetupRun<'a>(&'a AtomicBool);
 
impl SetupGuard {
    fn try_acquire(&self) -> Result<SetupRun<'_>, String> {
        if self.0.swap(true, Ordering::SeqCst) {
            Err("environment setup is already running".to_string())
        } else {
            Ok(SetupRun(&self.0))
        }
    }
}
 
impl Drop for SetupRun<'_> {
    fn drop(&mut self) {
        self.0.store(false, Ordering::SeqCst);
    }
}

#[tauri::command]
pub async fn ensure_environment(app: tauri::AppHandle, guard: State<'_, SetupGuard>) -> Result<(), String> {
    let _running = guard.try_acquire()?;
    let server_dir = get_local_server_dir(&app)?;
    fs::create_dir_all(&server_dir).map_err(|e| e.to_string())?;
    
    let _ = install_local_server(app).await;
    Ok(())
}


#[tauri::command]
pub async fn check_server_installed(app: tauri::AppHandle) -> Result<bool, String> {
    let state = load_state(&app);
    if state.step == InstallStep::Completed {
        let server_dir = get_local_server_dir(&app)?;
        let python_executable = server_dir.join(".venv").join(
            if cfg!(target_os = "windows") { "Scripts/python.exe" } else { "bin/python" }
        );
        return Ok(python_executable.exists());
    }
    
    Ok(false)
}

pub async fn install_local_server(app: tauri::AppHandle) -> Result<String, String> {
    let server_dir = get_local_server_dir(&app)?;
    let log_path = server_dir.join("logs");
    let _ = fs::create_dir(&log_path);

    let mut state = load_state(&app);
    let venv_path = server_dir.join(".venv");
    let python_in_venv = venv_path.join(
        if cfg!(target_os = "windows") { "Scripts/python.exe" } else { "bin/python" }
    );

    if state.step == InstallStep::NotStarted {
        let _ =run_uv_sidecar(
            &app,
            "venv", 10,
            &server_dir, &log_path,
            vec![
                "venv".into(), 
                venv_path.to_string_lossy().to_string(), 
                "--python".into(), 
                PYTHON_VERSION.into()
            ],
        )
        .await;

        state.step = InstallStep::VenvCreated;
        save_state(&app, &state)?;
    }

    if state.step == InstallStep::VenvCreated {
        let _ = run_uv_sidecar(
            &app,
            "nodeblocks", 50,
            &server_dir, &log_path,
            vec![
                "pip".into(), "install".into(),
                "--python".into(), 
                python_in_venv.to_string_lossy().to_string(), 
                NODEBLOCKS_WHEEL_URL.into()
            ],
        )
        .await;

        state.step = InstallStep::Completed;
        save_state(&app, &state)?;
    }

    let verify = app
        .shell()
        .command(python_in_venv)
        .args(vec![
            "-c".to_string(),
            format!("import nodeblocks"),
        ]);
    let _ = run_step(&app, &log_path, "verify", 95, verify);

    emit_progress(&app, PROGRESS_EVENT, "finished", 100, "Finished installing");
    Ok("Finished installation".into())
}


// -- state utils

fn load_state(app: &tauri::AppHandle) -> InstallState {
    let path = get_state_file_path(app);
    if let Ok(data) = fs::read_to_string(path) {
        if let Ok(state) = serde_json::from_str(&data) {
            return state;
        }
    }
    InstallState::default()
}

fn save_state(app: &tauri::AppHandle, state: &InstallState) -> Result<(), String> {
    let tmp = get_state_file_path(app).with_extension("json.tmp");
    let path = get_state_file_path(app);

    let bytes = serde_json::to_vec_pretty(state).map_err(|e| e.to_string())?;
    fs::write(&tmp, bytes).map_err(|e| format!("could not write state: {e}"))?;
    fs::rename(&tmp, &path).map_err(|e| format!("could not save state: {e}"))
}

// -- path utils

fn get_state_file_path(app: &tauri::AppHandle) -> PathBuf {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string()).unwrap();
    let _ = fs::create_dir_all(&app_dir).map_err(|e| e.to_string());
    return app_dir.join("install_state.json");
}

fn get_local_server_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    Ok(app_dir.join("local_server"))
}

// -- uv utils

async fn run_uv_sidecar(
    app: &tauri::AppHandle,
    step: &str,
    percent: u8,
    server_dir: &PathBuf,
    log_path: &PathBuf,
    args: Vec<String>,
) -> Result<(), String> {
    let python_install_dir = server_dir.join(".python_versions");
    let cache_dir = server_dir.join(".uv_cache");
    let envs: HashMap<String, String> = HashMap::from([
        ("UV_PYTHON_INSTALL_DIR".to_string(), python_install_dir.to_string_lossy().to_string()),
        ("UV_CACHE_DIR".to_string(), cache_dir.to_string_lossy().to_string()),
        ("UV_NO_PROGRESS".to_string(), "1".to_string()),
        ("UV_NO_CONFIG".to_string(), "1".to_string()),
        ("NO_COLOR".to_string(), "1".to_string()),
        ("UV_HTTP_TIMEOUT".to_string(), "300".to_string()),
    ]);

    let uv_command = app
        .shell()
        .sidecar("uv")
        .map_err(|e| format!("Failed to load uv sidecar: {}", e))?
        .args(args)
        .envs(envs);

    run_step(app, log_path, step, percent, uv_command).await
}

async fn run_step(
    app: &tauri::AppHandle,
    log_path: &PathBuf,
    step: &str,
    percent: u8,
    command: Command,
) -> Result<(), String> {
    const TAIL_LINES: usize = 40;
    let (mut rx, _child) = command
        .spawn()
        .map_err(|e| format!("could not start {step} step: {e}"))?;
 
    let mut log = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .ok();

    let mut tail: VecDeque<String> = VecDeque::with_capacity(TAIL_LINES);
    let mut exit_code: Option<i32> = None;
 
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(bytes) | CommandEvent::Stderr(bytes) => {
                let line = String::from_utf8_lossy(&bytes).trim().to_string();
                if line.is_empty() {
                    continue;
                }
                if let Some(file) = log.as_mut() {
                    let _ = writeln!(file, "[{step}] {line}");
                }
                emit_progress(app, PROGRESS_EVENT, step, percent, &line);
 
                if tail.len() == TAIL_LINES {
                    tail.pop_front();
                }
                tail.push_back(line);
            }
            CommandEvent::Error(e) => return Err(format!("step '{step}' failed: {e}")),
            CommandEvent::Terminated(payload) => {
                exit_code = payload.code;
                break;
            }
            _ => {}
        }
    }
 
    if exit_code == Some(0) {
        return Ok(());
    }
 
    let output = tail.into_iter().collect::<Vec<_>>().join("\n");
    Err(format!(
        "step '{step}' failed (exit code {exit_code:?}):\n{output}\n\nFull log: {}",
        log_path.display()
    ))
}