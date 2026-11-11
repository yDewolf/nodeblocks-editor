use serde::{Serialize, Deserialize};
use tauri_plugin_shell::ShellExt;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Manager, State};

const PYTHON_VERSION: &str = "3.14";
const NODEBLOCKS_WHEEL_URL: &str =
    "https://github.com/yDewolf/nodeblocks-server/releases/download/v0.2.0-beta/nodeblocks-0.2.0-py3-none-any.whl";

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

    let mut state = load_state(&app);
    let venv_path = server_dir.join(".venv");
    let python_in_venv = venv_path.join(
        if cfg!(target_os = "windows") { "Scripts/python.exe" } else { "bin/python" }
    );

    if state.step == InstallStep::NotStarted {
        let _ = run_uv_sidecar(
            &app,
            &server_dir,
            vec![
                "venv".into(), 
                venv_path.to_string_lossy().to_string(), 
                "--python".into(), 
                PYTHON_VERSION.into()
            ],
        )
        .await
        .map_err(|err| format!("Failed at instalation step 1: {}", err))?;

        state.step = InstallStep::VenvCreated;
        save_state(&app, &state)?;
    }

    if state.step == InstallStep::VenvCreated {
        let _ = run_uv_sidecar(
            &app,
            &server_dir,
            vec![
                "pip".into(), "install".into(),
                "--python".into(), 
                python_in_venv.to_string_lossy().to_string(), 
                NODEBLOCKS_WHEEL_URL.into()
            ],
        )
        .await
        .map_err(|err| format!("Failed at installation step 2: {}", err))?;

        state.step = InstallStep::Completed;
        save_state(&app, &state)?;
    }

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
    server_dir: &PathBuf,
    args: Vec<String>,
) -> Result<String, String> {
    let python_install_dir = server_dir.join(".python_versions");
    let cache_dir = server_dir.join(".uv_cache");
    let envs: HashMap<String, String> = HashMap::from([
        ("UV_PYTHON_INSTALL_DIR".to_string(), python_install_dir.to_string_lossy().to_string()),
        ("UV_CACHE_DIR".to_string(), cache_dir.to_string_lossy().to_string())
    ]);

    let output = app
        .shell()
        .sidecar("uv")
        .map_err(|e| format!("Falha ao carregar o sidecar uv: {}", e))?
        .args(args)
        .envs(envs)
        .output()
        .await
        .map_err(|e| format!("Erro na execução do comando uv: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(stderr.to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}