use tauri::AppHandle;

use crate::nodeblocks::server_config::server_config::{load_local_server_config, save_local_server_config};

#[tauri::command]
pub fn get_auto_start_local_server(app: AppHandle) -> bool {
    load_local_server_config(&app).auto_start_local_server
}

#[tauri::command]
pub fn set_auto_start_local_server(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut config = load_local_server_config(&app);
    config.auto_start_local_server = enabled;
    save_local_server_config(&app, &config)
}
