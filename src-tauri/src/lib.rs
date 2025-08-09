mod cua;
mod view;

use cua::*;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use view::{
    hide_browser, move_browser, navigate_browser, read_browser, render_browser, show_browser,
};

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
                height: size.height,
            })
        }
        Ok(None) => {
            // No monitor found, use fallback
            Ok(ScreenInfo {
                width: 1920,
                height: 1080,
            })
        }
        Err(e) => {
            // Error getting monitor info, use fallback
            eprintln!("Failed to get monitor info: {}", e);
            Ok(ScreenInfo {
                width: 1920,
                height: 1080,
            })
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_macos_permissions::init())
        .plugin(tauri_plugin_store::Builder::default().build())
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
            type_text,
            show_browser,
            hide_browser,
            move_browser,
            navigate_browser,
            read_browser,
            render_browser
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            let webview_builder = tauri::webview::WebviewBuilder::new(
                "browser",
                tauri::WebviewUrl::App("about:blank".into()),
            );
            let webview = window
                .add_child(
                    webview_builder,
                    tauri::LogicalPosition::new(0, 0),
                    window.inner_size().unwrap(),
                )
                .expect("unable to create webview");
            webview.hide().expect("uanble to hide webview");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
