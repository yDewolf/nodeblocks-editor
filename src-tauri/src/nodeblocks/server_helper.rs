use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use std::process::Child;
use std::sync::Mutex;

use tauri::Emitter;

use crate::env::environment::get_local_server_dir;

pub struct ServerProcessState(pub Mutex<Option<Child>>);

#[tauri::command]
pub async fn start_local_server(app: tauri::AppHandle, state: tauri::State<'_, ServerProcessState>) -> Result<String, String> {
    let server_dir = get_local_server_dir(&app)?;
    
    let plugins_dir = server_dir.join("plugins");
    let scenes_dir = server_dir.join("scenes");

    let internal_dir = server_dir.join("internal");
    let extraction_dir = internal_dir.join("extracted");
    let plugin_libs_dir = internal_dir.join("plugin_libs");

    std::fs::create_dir_all(&plugins_dir).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&scenes_dir).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&extraction_dir).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&plugin_libs_dir).map_err(|e| e.to_string())?;

    let nodeblocks_bin = server_dir.join(".venv").join(
        if cfg!(target_os = "windows") { "Scripts/nodeblocks.exe" } else { "bin/nodeblocks" }
    );

    if !nodeblocks_bin.exists() {
        return Err(format!("Couldn't find nodeblocks executable {:?}", nodeblocks_bin));
    }

    let mut child = Command::new(&nodeblocks_bin)
        .arg("run:server")
        .arg("--plugins")
        .arg(&plugins_dir)
        .arg("--scenes")
        .arg(&scenes_dir)
        .arg("--extraction")
        .arg(&extraction_dir)
        .env("PLUGIN_LIBS_FOLDER", &plugin_libs_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start local server: {}", e))?;

    if let Some(stdout) = child.stdout.take() {
        let app_handle = app.clone();
        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(content) = line {
                    let _ = app_handle.emit("server-log", content);
                }
            }
        });
    }

    if let Some(stderr) = child.stderr.take() {
        let app_handle = app.clone();
        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(content) = line {
                    let _ = app_handle.emit("server-log", content);
                }
            }
        });
    }

    let mut guard = state.0.lock().unwrap();
    if let Some(mut old_child) = guard.take() {
        let _ = old_child.kill();
    }
    *guard = Some(child);

    Ok("Started Local Server".into())
}

#[tauri::command]
pub fn stop_local_server(state: tauri::State<'_, ServerProcessState>) -> Result<String, String> {
    let mut guard = state.0.lock().unwrap();
    
    if let Some(mut child) = guard.take() {
        child.kill().map_err(|e| format!("Failed to finish server: {}", e))?;
        child.wait().map_err(|e| format!("Error while waiting for server finish: {}", e))?;
        Ok("Server Finished Successfully.".into())
    } else {
        Ok("No local server was running.".into())
    }
}

#[tauri::command]
pub fn is_local_server_running(state: tauri::State<'_, ServerProcessState>) -> Result<bool, String> {
    let mut guard = state.0.lock().unwrap();
    
    if let Some(child) = guard.as_mut() {
        match child.try_wait() {
            Ok(Some(_status)) => {
                *guard = None;
                Ok(false)
            }
            Ok(None) => {
                Ok(true)
            }
            Err(e) => {
                Err(format!("Failed to check process status: {}", e))
            }
        }
    } else {
        Ok(false)
    }
}