/// Simple command used by tests to verify Rust integration.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
        .invoke_handler(tauri::generate_handler![greet, run_applescript, capture_screenshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::greet;

    #[test]
    fn greet_returns_expected_string() {
        assert_eq!(greet("World"), "Hello, World! You've been greeted from Rust!");
    }
}
