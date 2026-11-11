mod env;

use env::environment;

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
      .invoke_handler(tauri::generate_handler![
          environment::check_server_installed,
          environment::ensure_environment,
      ])
    .on_page_load(|window, _| {
      window.eval("window.isTauriEnvironment = true;").unwrap();
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
