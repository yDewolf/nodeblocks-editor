use std::collections::{VecDeque};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{AppHandle, Manager};
use tauri_plugin_shell::process::{Command, CommandEvent};
use tauri_plugin_shell::ShellExt;

use crate::env::env_structs::{EnvPaths, InstallState, InstallStep, load_state, save_state, uv_env};
use crate::utils::path_utils::path_str;
use crate::utils::progress_event::emit_progress;

const PYTHON_VERSION: &str = "3.14";
const PROGRESS_EVENT: &str = "env-setup-progress";
const TAIL_LINES: usize = 40;


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

// -- internal methods

pub async fn ensure_environment_internal(
    app: &AppHandle,
    wheel_url: String,
    remove_previous: bool,
) -> Result<(), String> {
    let guard = app.state::<SetupGuard>();
    let _running = guard.try_acquire()?;

    let paths = EnvPaths::new(app)?;
    fs::create_dir_all(&paths.root).map_err(|e| e.to_string())?;

    install_local_server(app, &paths, wheel_url, remove_previous).await?;
    Ok(())
}

pub fn check_server_installed_internal(app: &AppHandle) -> Result<bool, String> {
    let paths = EnvPaths::new(app)?;
    let state = load_state(&paths);
    if state.step == InstallStep::Completed {
        return Ok(paths.venv_python().exists());
    }
    Ok(false)
}

pub async fn get_local_server_version_internal(app: &AppHandle) -> Result<String, String> {
    let paths = EnvPaths::new(app)?;
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
            path_str(&python_in_venv),
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

// -- internal utils

pub(crate) async fn install_local_server(
    app: &AppHandle,
    paths: &EnvPaths,
    wheel_url: String,
    remove_previous: bool,
) -> Result<String, String> {
    let mut state = if remove_previous {
        InstallState::default()
    } else {
        load_state(paths)
    };

    if state.wheel_url.as_ref() != Some(&wheel_url) && state.step == InstallStep::Completed {
        state.step = InstallStep::VenvCreated;
    }

    if state.step == InstallStep::NotStarted {
        run_uv_sidecar(
            app,
            paths,
            "venv",
            10,
            vec![
                "venv".into(),
                path_str(&paths.venv),
                "--clear".into(),
                "--python".into(),
                PYTHON_VERSION.into(),
            ],
        )
        .await?;

        state.step = InstallStep::VenvCreated;
        save_state(paths, &state)?;
    }

    if state.step == InstallStep::VenvCreated {
        run_uv_sidecar(
            app,
            paths,
            "nodeblocks",
            50,
            vec![
                "pip".into(),
                "install".into(),
                "--python".into(),
                path_str(&paths.venv_python()),
                wheel_url.clone(),
            ],
        )
        .await?;

        state.step = InstallStep::Completed;
        state.wheel_url = Some(wheel_url);
        save_state(paths, &state)?;
    }

    let verify = app
        .shell()
        .command(paths.venv_python())
        .args(vec!["-c".to_string(), "import nodeblocks".to_string()]);

    run_step(app, &paths.log, "verify", 95, verify).await?;

    emit_progress(app, PROGRESS_EVENT, "finished", 100, "Finished installing");
    Ok("Finished installation".into())
}


// -- utils

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
