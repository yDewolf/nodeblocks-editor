mod env;
mod nodeblocks;
mod utils;

use tauri::Manager;


use nodeblocks::server_config::config_tauri_commands::{
    get_auto_start_local_server, set_auto_start_local_server,
};
use nodeblocks::server_config::server_config;

use crate::env::env_tauri_commands::{check_server_installed, ensure_environment, get_local_server_version};
use crate::env::environment::{SetupGuard, check_server_installed_internal};
use crate::nodeblocks::server::server_helper::{ServerProcessState, is_local_server_running_internal, start_local_server_internal, stop_local_server_internal};
use crate::nodeblocks::server::server_tauri_commands::{get_server_host_and_port, is_local_server_running, open_plugins_folder, start_local_server, stop_local_server};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .manage(SetupGuard::default())
    .manage(ServerProcessState::default())
    .invoke_handler(tauri::generate_handler![
        check_server_installed,
        ensure_environment,
        get_local_server_version,
        start_local_server,
        stop_local_server,
        is_local_server_running,
        open_plugins_folder,
        get_auto_start_local_server,
        set_auto_start_local_server,
        get_server_host_and_port
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
            tauri_plugin_log::Builder::default()
              .level(log::LevelFilter::Info)
              .build(),
        )?;
      }

      let handle = app.handle().clone();
      let config = server_config::load_local_server_config(&handle);

      if config.auto_start_local_server {
        tauri::async_runtime::spawn(async move {
          let is_installed = check_server_installed_internal(&handle).unwrap_or(false);
          let is_running =
            is_local_server_running_internal(&handle.state::<ServerProcessState>())
                .unwrap_or(false);

          if is_installed && !is_running {
            if let Err(err) = start_local_server_internal(&handle).await {
                eprintln!("[Tauri] Failed to auto-start local server: {err}");
            }
          }
        });
      }

      Ok(())
    })
    .on_page_load(|window, _| {
        let _ = window.eval("window.isTauriEnvironment = true;");
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            let state = app_handle.state::<ServerProcessState>();
            let _ = stop_local_server_internal(&state);
        }
  });
}