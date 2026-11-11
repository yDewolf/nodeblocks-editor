mod env;
mod utils;
mod nodeblocks;

use std::{println, sync::Mutex};

use env::environment;
use nodeblocks::server_helper;
use tauri::Manager;

use crate::nodeblocks::server_helper::ServerProcessState;

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
    .plugin(tauri_plugin_shell::init())
    .manage(environment::SetupGuard::default())
    .manage(ServerProcessState(Mutex::new(None)))
      .invoke_handler(tauri::generate_handler![
        environment::check_server_installed,
        environment::ensure_environment,
        server_helper::start_local_server,
        server_helper::stop_local_server,
        server_helper::is_local_server_running,
      ])
    .on_page_load(|window, _| {
      window.eval("window.isTauriEnvironment = true;").unwrap();
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
      if let tauri::RunEvent::Exit = event {
        let state = app_handle.state::<ServerProcessState>();
        let mut guard = state.0.lock().unwrap();
        if let Some(mut child) = guard.take() {
          println!("Killing nodeblocks server process");
          let _ = child.kill();
          let _ = child.wait();
        }
      }
    });
}
