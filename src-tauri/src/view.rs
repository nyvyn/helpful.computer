use serde::{Deserialize, Serialize};
use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager};

#[derive(Serialize, Deserialize)]
pub struct WebviewRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

fn get_window_frame_offset(_app: &AppHandle) -> Result<LogicalPosition<f64>, String> {
    // Return hardcoded values based on OS
    #[cfg(target_os = "macos")]
    return Ok(LogicalPosition::new(0.0, 28.0)); // macOS title bar height

    #[cfg(target_os = "windows")]
    return Ok(LogicalPosition::new(8.0, 31.0)); // Windows border and title bar

    #[cfg(target_os = "linux")]
    return Ok(LogicalPosition::new(0.0, 30.0)); // Linux title bar height

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    return Ok(LogicalPosition::new(0.0, 30.0)); // Default fallback
}

#[tauri::command]
pub fn show_browser(app: AppHandle, rect: WebviewRect) -> Result<(), String> {
    let webviews = app.webviews();
    if let Some(webview) = webviews.get("browser") {
        // Move the webview first
        move_browser(app, rect)?;

        // Then show it
        webview.show().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Webview 'browser' not found".to_string())
    }
}

#[tauri::command]
pub fn move_browser(app: AppHandle, rect: WebviewRect) -> Result<(), String> {
    let webviews = app.webviews();
    if let Some(webview) = webviews.get("browser") {
        // Get window frame offset to convert viewport coordinates to window coordinates
        let frame_offset = get_window_frame_offset(&app)?;

        // Convert viewport coordinates to window coordinates
        let window_x = rect.x + frame_offset.x;
        let window_y = rect.y + frame_offset.y;

        // Set position and size using corrected coordinates
        webview
            .set_position(LogicalPosition::new(window_x, window_y))
            .map_err(|e| e.to_string())?;
        webview
            .set_size(LogicalSize::new(rect.width, rect.height))
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Webview 'browser' not found".to_string())
    }
}

#[tauri::command]
pub fn hide_browser(app: AppHandle) -> Result<(), String> {
    let webviews = app.webviews();
    if let Some(webview) = webviews.get("browser") {
        webview.hide().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Webview 'browser' not found".to_string())
    }
}

#[tauri::command]
pub fn navigate_browser(app: AppHandle, url: String) -> Result<(), String> {
    let webviews = app.webviews();
    if let Some(webview) = webviews.get("browser") {
        let parsed_url = url.parse().map_err(|e| format!("{:?}", e))?;
        webview.navigate(parsed_url).map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Webview 'browser' not found".to_string())
    }
}
