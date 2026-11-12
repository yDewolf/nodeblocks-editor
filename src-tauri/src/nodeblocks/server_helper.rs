use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

use crate::env::environment::get_local_server_dir;
use crate::environment::{uv_env, EnvPaths};

const LOG_EVENT: &str = "server-log";
const EXITED_EVENT: &str = "server-exited";

#[derive(Default)]
pub struct ServerProcessState(pub Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[derive(Clone, Serialize)]
struct ServerExited {
    code: Option<i32>,
}

struct ServerDirs {
    root: PathBuf,
    plugins: PathBuf,
    extraction: PathBuf,
    scenes: PathBuf,
    plugin_libs: PathBuf,
    log: PathBuf,
}

impl ServerDirs {
    fn new(app: &AppHandle) -> Result<Self, String> {
        let root = get_local_server_dir(app).unwrap();
        let plugins = root.join("plugins");
        let internal = root.join("internal");

        Ok(Self {
            extraction: internal.join("extracted"),
            plugin_libs: internal.join("plugin_libs"),
            scenes: root.join("scenes"),
            log: root.join("server.log"),
            plugins,
            root,
        })
    }

    fn create_all(&self) -> Result<(), String> {
        for dir in [&self.plugins, &self.extraction, &self.scenes, &self.plugin_libs] {
            fs::create_dir_all(dir).map_err(|e| format!("could not create {}: {e}", dir.display()))?;
        }
        Ok(())
    }
}

#[tauri::command]
pub async fn start_local_server(app: AppHandle, state: State<'_, ServerProcessState>) -> Result<String, String> {
    {
        let guard = state.0.lock().map_err(|_| "server state might be poisoned".to_string())?;
        if guard.is_some() {
            return Err("the server is already running".to_string());
        }
    }

    let env_paths = EnvPaths::new(&app)?;
    let executable = nodeblocks_executable(&env_paths);
    if !executable.is_file() {
        return Err(format!(
            "nodeblocks executable not found at {}. Might need to run environment installation",
            executable.display()
        ));
    }

    let dirs = ServerDirs::new(&app)?;
    dirs.create_all()?;

    let mut env = uv_env(&env_paths);
    env.insert("PLUGIN_LIBS_FOLDER".to_string(), path_str(&dirs.plugin_libs));
    env.insert("INCLUDE_REMOTE_ACCESS_ROUTES".to_string(), "True".to_string());
    env.insert("PYTHONUTF8".to_string(), "1".to_string());
    env.insert("PYTHONIOENCODING".to_string(), "utf-8".to_string());
    env.insert("PYTHONUNBUFFERED".to_string(), "1".to_string());

    let args = vec![
        "run:server".to_string(),
        "--plugins".to_string(),
        path_str(&dirs.plugins),
        "--extraction".to_string(),
        path_str(&dirs.extraction),
        "--scenes".to_string(),
        path_str(&dirs.scenes),
    ];

    let (mut rx, child) = app
        .shell()
        .command(executable)
        .args(args)
        .envs(env)
        .current_dir(&dirs.root)
        .spawn()
        .map_err(|e| format!("could not start the server: {e}"))?;

    *state
        .0
        .lock()
        .map_err(|_| "server state is poisoned".to_string())? = Some(child);

    let monitor_app = app.clone();
    let log_path = dirs.log.clone();
    tauri::async_runtime::spawn(async move {
        let mut log = OpenOptions::new().create(true).append(true).open(&log_path).ok();
        let mut exit_code: Option<i32> = None;

        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(bytes) | CommandEvent::Stderr(bytes) => {
                    let line = String::from_utf8_lossy(&bytes).trim_end().to_string();
                    if !line.is_empty() {
                        if let Some(file) = log.as_mut() {
                            let _ = writeln!(file, "{line}");
                        }
                        let _ = monitor_app.emit(LOG_EVENT, &line);
                    }
                }
                CommandEvent::Error(e) => {
                    if let Some(file) = log.as_mut() {
                        let _ = writeln!(file, "{e}");
                    }
                }
                CommandEvent::Terminated(payload) => {
                    exit_code = payload.code;
                    break;
                }
                _ => {}
            }
        }

        if let Some(state) = monitor_app.try_state::<ServerProcessState>() {
            if let Ok(mut guard) = state.0.lock() {
                *guard = None;
            }
        }
        let _ = monitor_app.emit(EXITED_EVENT, ServerExited { code: exit_code });
    });

    Ok("Started Local Server".into())
}

#[tauri::command]
pub fn stop_local_server(state: State<'_, ServerProcessState>) -> Result<String, String> {
    let child = state
        .0
        .lock()
        .map_err(|_| "server state is poisoned".to_string())?
        .take();

    if let Some(child) = child {
        kill_process_tree(child.pid());
        let _ = child.kill();
        Ok("Server Finished Successfully.".into())
    } else {
        Ok("No local server was running.".into())
    }
}

#[tauri::command]
pub fn is_local_server_running(state: State<'_, ServerProcessState>) -> Result<bool, String> {
    let guard = state
        .0
        .lock()
        .map_err(|_| "server state is poisoned".to_string())?;
    Ok(guard.is_some())
}

#[cfg(windows)]
fn kill_process_tree(pid: u32) {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    let _ = std::process::Command::new("taskkill")
        .args(["/PID", pid.to_string().as_str(), "/T", "/F"])
        .creation_flags(CREATE_NO_WINDOW)
        .status();
}

#[cfg(not(windows))]
fn kill_process_tree(pid: u32) {
    let _ = std::process::Command::new("pkill")
        .args(["-TERM", "-P", pid.to_string().as_str()])
        .status();
}

fn nodeblocks_executable(paths: &EnvPaths) -> PathBuf {
    if cfg!(windows) {
        paths.venv.join("Scripts").join("nodeblocks.exe")
    } else {
        paths.venv.join("bin").join("nodeblocks")
    }
}

fn path_str(path: &PathBuf) -> String {
    path.to_string_lossy().to_string()
}
