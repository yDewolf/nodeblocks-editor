use tauri::{AppHandle, State};

use crate::env::environment::{SetupGuard, check_server_installed_internal, ensure_environment_internal, get_local_server_version_internal};

#[tauri::command]
pub async fn ensure_environment(
    app: AppHandle,
    _guard: State<'_, SetupGuard>,
    wheel_url: String,
    remove_previous: bool,
) -> Result<(), String> {
    ensure_environment_internal(&app, wheel_url, remove_previous).await
}

#[tauri::command]
pub fn check_server_installed(app: AppHandle) -> Result<bool, String> {
    check_server_installed_internal(&app)
}

#[tauri::command]
pub async fn get_local_server_version(app: AppHandle) -> Result<String, String> {
    get_local_server_version_internal(&app).await
}
