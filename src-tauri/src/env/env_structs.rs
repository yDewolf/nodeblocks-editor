
use std::{collections::HashMap, fs, path::PathBuf};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::utils::path_utils::path_str;
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum InstallStep {
    NotStarted,
    VenvCreated,
    Completed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(super) struct InstallState {
    pub(super) step: InstallStep,
    pub(super) wheel_url: Option<String>,
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
    pub(crate) state: PathBuf,
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


// utils


pub(super) fn load_state(env_paths: &EnvPaths) -> InstallState {
    let path = &env_paths.state;
    if let Ok(data) = fs::read_to_string(path) {
        if let Ok(state) = serde_json::from_str(&data) {
            return state;
        }
    }
    InstallState::default()
}

pub(super) fn save_state(env_paths: &EnvPaths, state: &InstallState) -> Result<(), String> {
    let path = &env_paths.state;
    let tmp = path.with_extension("json.tmp");

    let bytes = serde_json::to_vec_pretty(state).map_err(|e| e.to_string())?;
    fs::write(&tmp, bytes).map_err(|e| format!("could not write state: {e}"))?;
    fs::rename(&tmp, path).map_err(|e| format!("could not save state: {e}"))
}

pub fn get_local_server_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    Ok(app_dir.join("local_server"))
}


// -- env utils

pub fn uv_env(paths: &EnvPaths) -> HashMap<String, String> {
    HashMap::from([
        (
            "UV_PYTHON_INSTALL_DIR".to_string(),
            path_str(&paths.python_install_dir),
        ),
        (
            "UV_CACHE_DIR".to_string(),
            path_str(&paths.uv_cache),
        ),
        ("UV_NO_PROGRESS".to_string(), "1".to_string()),
        ("UV_NO_CONFIG".to_string(), "1".to_string()),
        ("NO_COLOR".to_string(), "1".to_string()),
        ("UV_HTTP_TIMEOUT".to_string(), "300".to_string()),
    ])
}