use base64::engine::Engine;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, State};

pub struct PageStore(pub Arc<Mutex<Option<String>>>);

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
pub async fn navigate_browser(
    app: AppHandle,
    state: State<'_, PageStore>,
    url: String,
) -> Result<(), String> {
    let webviews = app.webviews();
    if let Some(webview) = webviews.get("browser") {
        let parsed_url = url.parse().map_err(|e| format!("{:?}", e))?;
        webview.navigate(parsed_url).map_err(|e| e.to_string())?;

        // Fetch the URL content in the background and store it
        let url_clone = url.clone();
        let state_clone = state.0.clone();
        tokio::spawn(async move {
            if let Ok(response) = reqwest::get(&url_clone).await {
                if let Ok(html) = response.text().await {
                    if let Ok(mut store) = state_clone.lock() {
                        *store = Some(html);
                    }
                }
            }
        });

        Ok(())
    } else {
        Err("Webview 'browser' not found".to_string())
    }
}

#[tauri::command]
pub async fn render_browser(
    app: AppHandle,
    state: State<'_, PageStore>,
    html: String,
) -> Result<(), String> {
    // Store the HTML content
    *state.0.lock().map_err(|e| e.to_string())? = Some(html.clone());

    let data_url = format!(
        "data:text/html;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(html)
    );

    navigate_browser(app, state, data_url).await
}

#[tauri::command]
pub fn read_browser(state: State<PageStore>) -> Result<String, String> {
    state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or("No page content available yet".to_string())
}
