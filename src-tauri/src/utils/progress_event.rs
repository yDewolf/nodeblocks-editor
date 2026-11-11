use serde::Serialize;
use tauri::Emitter;


#[derive(Clone, Serialize)]
struct Progress {
    step: String,
    percent: u8,
    message: String,
}

pub fn emit_progress(app: &tauri::AppHandle, event: &str, step: &str, percent: u8, message: &str) {
    let _ = app.emit(
        event,
        Progress {
            step: step.to_string(),
            percent,
            message: message.to_string(),
        },
    );
}