mod env;
mod utils;
mod nodeblocks;

use env::environment;
use nodeblocks::server_helper;
use tauri::Manager;
use nodeblocks::server_config::server_config;
use nodeblocks::server_config::config_tauri_commands;

use crate::env::environment::check_server_installed;
use crate::nodeblocks::server_helper::ServerProcessState;
use crate::nodeblocks::server_helper::is_local_server_running;
use crate::nodeblocks::server_helper::start_local_server;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .manage(environment::SetupGuard::default())
    .manage(server_helper::ServerProcessState::default())
    .invoke_handler(tauri::generate_handler![
      environment::check_server_installed,
      environment::ensure_environment,
      environment::get_local_server_version,
      server_helper::start_local_server,
      server_helper::stop_local_server,
      server_helper::is_local_server_running,
      server_helper::open_plugins_folder,
      config_tauri_commands::get_auto_start_local_server,
      config_tauri_commands::set_auto_start_local_server,
    ])
    .setup(|app| {
      let handle = app.handle().clone();
      let state: tauri::State<'_, ServerProcessState> = app.state();
      let config = server_config::load_local_server_config(&handle);

      if config.auto_start_local_server {
          // Dispara em uma task assíncrona do Tauri para não travar a abertura da janela
          tauri::async_runtime::spawn(async move {
              if check_server_installed(handle).unwrap() && !is_local_server_running(state).unwrap() {
                  if let Err(err) = start_local_server(, app.state()).await {
                      eprintln!("[Tauri] Failed to auto-start local server: {err}");
                  }
              }
          });
      }
      Ok(())
    })
    .on_page_load(|window, _| {
      window.eval("window.isTauriEnvironment = true;").unwrap();
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
      if let tauri::RunEvent::Exit = event {
        let _ = server_helper::stop_local_server(app_handle.state());
      }
    });
}
