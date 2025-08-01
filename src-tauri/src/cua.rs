use std::process::Command;


#[tauri::command]
pub fn click_at(x: i32, y: i32, button: Option<String>) -> Result<(), String> {
    let button_num = match button.as_deref().unwrap_or("left") {
        "left" => "1",
        "right" => "2",
        "middle" => "3",
        _ => "1",
    };

    let script = format!(
        r#"tell application "System Events" to click at {{{}, {}}} using button {}"#,
        x, y, button_num
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn double_click_at(x: i32, y: i32) -> Result<(), String> {
    let script = format!(
        r#"tell application "System Events" to double click at {{{}, {}}}"#,
        x, y
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn drag_from_to(path: Vec<serde_json::Value>) -> Result<(), String> {
    if path.len() < 2 {
        return Err("Path must contain at least 2 points".to_string());
    }

    let start = &path[0];
    let end = &path[path.len() - 1];

    let start_x = start["x"].as_i64().ok_or("Invalid start x coordinate")?;
    let start_y = start["y"].as_i64().ok_or("Invalid start y coordinate")?;
    let end_x = end["x"].as_i64().ok_or("Invalid end x coordinate")?;
    let end_y = end["y"].as_i64().ok_or("Invalid end y coordinate")?;

    let script = format!(
        r#"tell application "System Events"
            set startPoint to {{{}, {}}}
            set endPoint to {{{}, {}}}
            
            click at startPoint
            delay 0.1
            key down option
            delay 0.1
            click at endPoint
            delay 0.1
            key up option
        end tell"#,
        start_x, start_y, end_x, end_y
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn press_key(key: String) -> Result<(), String> {
    let key_code = match key.as_str() {
        "Return" => "return",
        "Tab" => "tab",
        "Space" => "space",
        "Escape" => "escape",
        "Delete" => "delete",
        "Backspace" => "delete",
        "ArrowUp" => "up arrow",
        "ArrowDown" => "down arrow",
        "ArrowLeft" => "left arrow",
        "ArrowRight" => "right arrow",
        "Home" => "home",
        "End" => "end",
        "PageUp" => "page up",
        "PageDown" => "page down",
        _ => &key,
    };

    let script = format!(
        r#"tell application "System Events" to key code (key code of "{}")"#,
        key_code
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn move_mouse_to(x: i32, y: i32) -> Result<(), String> {
    let script = format!(
        r#"tell application "System Events" to set mouse location to {{{}, {}}}"#,
        x, y
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn scroll_at(x: i32, y: i32, scroll_x: i32, scroll_y: i32) -> Result<(), String> {
    let script = format!(
        r#"tell application "System Events"
            set mouse location to {{{}, {}}}
            delay 0.1
            scroll (at {{{}, {}}}) by {{horizontal {}, vertical {}}}
        end tell"#,
        x, y, x, y, scroll_x, scroll_y
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn type_text(text: String) -> Result<(), String> {
    let escaped_text = text.replace("\"", "\\\"").replace("\\", "\\\\");

    let script = format!(
        r#"tell application "System Events" to keystroke "{}""#,
        escaped_text
    );

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
