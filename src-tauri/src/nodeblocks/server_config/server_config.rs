use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalServerConfig {
    pub auto_start_local_server: bool,
}

impl Default for LocalServerConfig {
    fn default() -> Self {
        Self {
            auto_start_local_server: true,
        }
    }
}

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to resolve app config dir: {e}"))?;

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config dir: {e}"))?;
    }
    
    Ok(config_dir.join("local_server_config.json"))
}

pub fn load_local_server_config(app: &AppHandle) -> LocalServerConfig {
    let Ok(path) = get_config_path(app) else {
        return LocalServerConfig::default();
    };

    fs::read_to_string(path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

pub fn save_local_server_config(app: &AppHandle, config: &LocalServerConfig) -> Result<(), String> {
    let path = get_config_path(app)?;
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {e}"))?;

    fs::write(path, json).map_err(|e| format!("Failed to write config file: {e}"))
}
