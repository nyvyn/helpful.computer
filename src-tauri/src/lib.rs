mod cua;
use cua::*;
use serde::{Deserialize, Serialize};
use xcap::image;

#[derive(Serialize, Deserialize)]
pub struct ScreenInfo {
    pub width: u32,
    pub height: u32,
}

#[tauri::command]
fn get_screen_dimensions(window: tauri::Window) -> Result<ScreenInfo, String> {
    match window.current_monitor() {
        Ok(Some(monitor)) => {
            let size = monitor.size();
            Ok(ScreenInfo { 
                width: size.width, 
                height: size.height 
            })
        },
        Ok(None) => {
            // No monitor found, use fallback
            Ok(ScreenInfo { width: 1920, height: 1080 })
        },
        Err(e) => {
            // Error getting monitor info, use fallback
            eprintln!("Failed to get monitor info: {}", e);
            Ok(ScreenInfo { width: 1920, height: 1080 })
        }
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
/// Hides the current window, takes the screenshot, then restores the window.
#[tauri::command]
async fn capture_screenshot(window: tauri::Window) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    use xcap::Monitor;
    use std::io::Cursor;
    use std::time::Duration;
    use tokio::time::sleep;

    // Hide the current window
    window.hide().map_err(|e| e.to_string())?;
    
    // Wait a brief moment for the window to be hidden
    sleep(Duration::from_millis(100)).await;

    // Get the primary monitor
    let monitors = Monitor::all().map_err(|e| e.to_string())?;
    let monitor = monitors.first().ok_or("No monitors found")?;
    
    // Capture screenshot
    let image = monitor.capture_image().map_err(|e| e.to_string())?;
    
    // Show the window again
    window.show().map_err(|e| e.to_string())?;
    
    // Convert to PNG bytes
    let mut buffer = Vec::new();
    let mut cursor = Cursor::new(&mut buffer);
    image.write_to(&mut cursor, image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;

    // Encode to base64
    Ok(general_purpose::STANDARD.encode(buffer))
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

