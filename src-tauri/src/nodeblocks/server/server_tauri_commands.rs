use crate::nodeblocks::server::server_helper::{ServerProcessState, get_server_host_and_port_internal, is_local_server_running_internal, open_plugins_folder_internal, start_local_server_internal, stop_local_server_internal};
use tauri::{self, AppHandle, State};

#[tauri::command]
pub async fn start_local_server(app: AppHandle) -> Result<String, String> {
    start_local_server_internal(&app).await
}

#[tauri::command]
pub fn stop_local_server(state: State<'_, ServerProcessState>) -> Result<String, String> {
    stop_local_server_internal(&state)
}

#[tauri::command]
pub fn is_local_server_running(state: State<'_, ServerProcessState>) -> Result<bool, String> {
    is_local_server_running_internal(&state)
}

#[tauri::command]
pub fn open_plugins_folder(app: AppHandle) -> Result<(), String> {
    open_plugins_folder_internal(&app)
}

#[tauri::command]
pub fn get_server_host_and_port(
    state: State<'_, ServerProcessState>,
) -> Result<Option<(String, u16)>, String> {
    get_server_host_and_port_internal(&state)
}