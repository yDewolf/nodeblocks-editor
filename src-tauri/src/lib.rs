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
    .on_page_load(|window, _| {
      window.eval("window.isTauriEnvironment = true;").unwrap();
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
