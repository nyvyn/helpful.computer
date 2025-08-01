mod cua;
use cua::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ScreenInfo {
    pub width: u32,
    pub height: u32,
}

#[tauri::command]
fn get_screen_dimensions() -> Result<ScreenInfo, String> {
    use std::process::Command;
    
    let script = r#"
        tell application "System Events"
            set screenSize to (get bounds of desktop 1)
            set screenWidth to (item 3 of screenSize) - (item 1 of screenSize)
            set screenHeight to (item 4 of screenSize) - (item 2 of screenSize)
            return screenWidth & "," & screenHeight
        end tell
    "#;
    
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .map_err(|e| e.to_string())?;
        
    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout);
        let dimensions: Vec<&str> = result.trim().split(',').collect();
        
        if dimensions.len() == 2 {
            let width = dimensions[0].parse::<u32>().map_err(|_| "Invalid width")?;
            let height = dimensions[1].parse::<u32>().map_err(|_| "Invalid height")?;
            
            Ok(ScreenInfo { width, height })
        } else {
            Err("Failed to parse screen dimensions".to_string())
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn get_os_info() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    return Ok("mac".to_string());
    
    #[cfg(target_os = "windows")]
    return Ok("windows".to_string());
    
    #[cfg(target_os = "linux")]
    return Ok("linux".to_string());
    
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    return Ok("unknown".to_string());
}

/// Execute an AppleScript on macOS and return the output.
#[tauri::command]
fn run_applescript(script: &str) -> Result<String, String> {
    use std::process::Command;
    
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Capture a desktop screenshot and return it as a base64 PNG string.
#[tauri::command]
fn capture_screenshot() -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    use std::process::Command;
    use std::fs;

    let path = std::env::temp_dir().join("helpful_screenshot.png");
    let status = Command::new("screencapture")
        .args(["-x", path.to_str().unwrap()])
        .status()
        .map_err(|e| e.to_string())?;

    if !status.success() {
        return Err("screencapture failed".into());
    }

    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    Ok(general_purpose::STANDARD.encode(bytes))
}

/// Build the Tauri application and start the runtime.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_macos_permissions::init())
        .invoke_handler(tauri::generate_handler![
            run_applescript, 
            capture_screenshot,
            get_screen_dimensions,
            get_os_info,
            click_at,
            double_click_at,
            drag_from_to,
            press_key,
            move_mouse_to,
            scroll_at,
            type_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

