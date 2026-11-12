use std::collections::{HashMap, VecDeque};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::process::{Command, CommandEvent};
use tauri_plugin_shell::ShellExt;

use crate::utils::progress_event::emit_progress;

const PYTHON_VERSION: &str = "3.14";
const PROGRESS_EVENT: &str = "env-setup-progress";
const TAIL_LINES: usize = 40;


#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
enum InstallStep {
    NotStarted,
    VenvCreated,
    Completed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct InstallState {
    step: InstallStep,
    wheel_url: Option<String>,
}

impl Default for InstallState {
    fn default() -> Self {
        Self {
            step: InstallStep::NotStarted,
            wheel_url: None,
        }
    }
}

pub(crate) struct EnvPaths {
    pub(crate) root: PathBuf,
    pub(crate) python_install_dir: PathBuf,
    pub(crate) uv_cache: PathBuf,
    pub(crate) venv: PathBuf,
    state: PathBuf,
    pub(crate) log: PathBuf,
}

impl EnvPaths {
    pub(crate) fn new(app: &AppHandle) -> Result<Self, String> {
        let root = get_local_server_dir(app)?;

        Ok(Self {
            python_install_dir: root.join(".python_versions"),
            uv_cache: root.join(".uv_cache"),
            venv: root.join(".venv"),
            state: root.join("install_state.json"),
            log: root.join("setup.log"),
            root,
        })
    }

    pub(crate) fn venv_python(&self) -> PathBuf {
        if cfg!(target_os = "windows") {
            self.venv.join("Scripts").join("python.exe")
        } else {
            self.venv.join("bin").join("python")
        }
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

// -- commands

#[tauri::command]
pub async fn ensure_environment(
    app: AppHandle,
    guard: State<'_, SetupGuard>,
    wheel_url: String,
) -> Result<(), String> {
    let _running = guard.try_acquire()?;
    let paths = EnvPaths::new(&app)?;
    fs::create_dir_all(&paths.root).map_err(|e| e.to_string())?;

    let _ = install_local_server(app, paths, wheel_url).await;
    Ok(())
}

#[tauri::command]
pub async fn check_server_installed(app: AppHandle) -> Result<bool, String> {
    let paths = EnvPaths::new(&app)?;
    let state = load_state(&paths);
    if state.step == InstallStep::Completed {
        let paths = EnvPaths::new(&app)?;
        return Ok(paths.venv_python().exists());
    }
    Ok(false)
}

#[tauri::command]
pub async fn get_local_server_version(app: AppHandle) -> Result<String, String> {
    let paths = EnvPaths::new(&app)?;
    let python_in_venv = paths.venv_python();

    if !python_in_venv.exists() {
        return Err("Venv not found".to_string());
    }

    let output = app
        .shell()
        .sidecar("uv")
        .map_err(|e| format!("Failed to load uv sidecar: {}", e))?
        .args(vec![
            "pip".to_string(),
            "show".to_string(),
            "nodeblocks".to_string(),
            "--python".to_string(),
            python_in_venv.to_string_lossy().to_string(),
        ])
        .envs(uv_env(&paths))
        .output()
        .await
        .map_err(|e| format!("Failed to run uv command: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to check package: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        if line.starts_with("Version:") {
            return Ok(line.replace("Version:", "").trim().to_string());
        }
    }

    Err("Couldn't find server version in uv".to_string())
}

// -- installation stuff

pub async fn install_local_server(
    app: AppHandle,
    paths: EnvPaths,
    wheel_url: String,
) -> Result<String, String> {
    let mut state = load_state(&paths);
    if state.wheel_url.as_ref() != Some(&wheel_url) && state.step == InstallStep::Completed {
        state.step = InstallStep::VenvCreated;
    }

    if state.step == InstallStep::NotStarted {
        let _ = run_uv_sidecar(
            &app,
            &paths,
            "venv",
            10,
            vec![
                "venv".into(),
                paths.venv.to_string_lossy().into(),
                "--python".into(),
                PYTHON_VERSION.into(),
            ],
        )
        .await;

        state.step = InstallStep::VenvCreated;
        save_state(&paths, &state)?;
    }

    if state.step == InstallStep::VenvCreated {
        let _ = run_uv_sidecar(
            &app,
            &paths,
            "nodeblocks",
            50,
            vec![
                "pip".into(),
                "install".into(),
                "--python".into(),
                paths.venv_python().to_string_lossy().into(),
                wheel_url.clone(),
            ],
        )
        .await?;

        state.step = InstallStep::Completed;
        state.wheel_url = Some(wheel_url);
        save_state(&paths, &state)?;
    }

    let verify = app
        .shell()
        .command(paths.venv_python())
        .args(vec!["-c".to_string(), "import nodeblocks".to_string()]);

    let _ = run_step(&app, &paths.log, "verify", 95, verify).await?;

    emit_progress(&app, PROGRESS_EVENT, "finished", 100, "Finished installing");
    Ok("Finished installation".into())
}

// -- state and path utils  

fn load_state(env_paths: &EnvPaths) -> InstallState {
    let path = &env_paths.state;
    if let Ok(data) = fs::read_to_string(path) {
        if let Ok(state) = serde_json::from_str(&data) {
            return state;
        }
    }
    InstallState::default()
}

fn save_state(env_paths: &EnvPaths, state: &InstallState) -> Result<(), String> {
    let path = &env_paths.state;
    let tmp = path.with_extension("json.tmp");

    let bytes = serde_json::to_vec_pretty(state).map_err(|e| e.to_string())?;
    fs::write(&tmp, bytes).map_err(|e| format!("could not write state: {e}"))?;
    fs::rename(&tmp, &path).map_err(|e| format!("could not save state: {e}"))
}

pub fn get_local_server_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    Ok(app_dir.join("local_server"))
}

// uv helpers

pub(crate) fn uv_env(paths: &EnvPaths) -> HashMap<String, String> {
    HashMap::from([
        (
            "UV_PYTHON_INSTALL_DIR".to_string(),
            paths.python_install_dir.to_string_lossy().to_string(),
        ),
        (
            "UV_CACHE_DIR".to_string(),
            paths.uv_cache.to_string_lossy().to_string(),
        ),
        ("UV_NO_PROGRESS".to_string(), "1".to_string()),
        ("UV_NO_CONFIG".to_string(), "1".to_string()),
        ("NO_COLOR".to_string(), "1".to_string()),
        ("UV_HTTP_TIMEOUT".to_string(), "300".to_string()),
    ])
}

async fn run_uv_sidecar(
    app: &AppHandle,
    paths: &EnvPaths,
    step: &str,
    percent: u8,
    args: Vec<String>,
) -> Result<(), String> {
    let envs = uv_env(paths);
    let uv_command = app
        .shell()
        .sidecar("uv")
        .map_err(|e| format!("Failed to load uv sidecar: {}", e))?
        .args(args)
        .envs(envs);

    run_step(app, &paths.log, step, percent, uv_command).await
}

async fn run_step(
    app: &AppHandle,
    log_path: &PathBuf,
    step: &str,
    percent: u8,
    command: Command,
) -> Result<(), String> {
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