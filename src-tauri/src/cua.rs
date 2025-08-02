use enigo::{Enigo, Mouse, Keyboard, Settings, Button, Direction, Key};

#[tauri::command]
pub fn click_at(x: i32, y: i32, button: Option<String>) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    // Move mouse to position
    enigo.move_mouse(x, y, enigo::Coordinate::Abs).map_err(|e| e.to_string())?;
    
    // Determine button type
    let btn = match button.as_deref().unwrap_or("left") {
        "left" => Button::Left,
        "right" => Button::Right,
        "middle" => Button::Middle,
        _ => Button::Left,
    };
    
    // Click
    enigo.button(btn, Direction::Click).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn double_click_at(x: i32, y: i32) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    // Move mouse to position
    enigo.move_mouse(x, y, enigo::Coordinate::Abs).map_err(|e| e.to_string())?;
    
    // Double click
    enigo.button(Button::Left, Direction::Click).map_err(|e| e.to_string())?;
    std::thread::sleep(std::time::Duration::from_millis(50));
    enigo.button(Button::Left, Direction::Click).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn drag_from_to(path: Vec<serde_json::Value>) -> Result<(), String> {
    if path.len() < 2 {
        return Err("Path must contain at least 2 points".to_string());
    }
    
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    let start = &path[0];
    let end = &path[path.len() - 1];
    
    let start_x = start["x"].as_i64().ok_or("Invalid start x coordinate")? as i32;
    let start_y = start["y"].as_i64().ok_or("Invalid start y coordinate")? as i32;
    let end_x = end["x"].as_i64().ok_or("Invalid end x coordinate")? as i32;
    let end_y = end["y"].as_i64().ok_or("Invalid end y coordinate")? as i32;
    
    // Move to start position
    enigo.move_mouse(start_x, start_y, enigo::Coordinate::Abs).map_err(|e| e.to_string())?;
    
    // Press down
    enigo.button(Button::Left, Direction::Press).map_err(|e| e.to_string())?;
    
    // Drag to end position
    enigo.move_mouse(end_x, end_y, enigo::Coordinate::Abs).map_err(|e| e.to_string())?;
    
    // Release
    enigo.button(Button::Left, Direction::Release).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn press_key(key: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    let enigo_key = match key.as_str() {
        "Return" => Key::Return,
        "Tab" => Key::Tab,
        "Space" => Key::Space,
        "Escape" => Key::Escape,
        "Delete" => Key::Delete,
        "Backspace" => Key::Backspace,
        "ArrowUp" => Key::UpArrow,
        "ArrowDown" => Key::DownArrow,
        "ArrowLeft" => Key::LeftArrow,
        "ArrowRight" => Key::RightArrow,
        "Home" => Key::Home,
        "End" => Key::End,
        "PageUp" => Key::PageUp,
        "PageDown" => Key::PageDown,
        _ => {
            // For regular characters, use text input
            enigo.text(&key).map_err(|e| e.to_string())?;
            return Ok(());
        }
    };
    
    enigo.key(enigo_key, Direction::Click).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn move_mouse_to(x: i32, y: i32) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    enigo.move_mouse(x, y, enigo::Coordinate::Abs).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn scroll_at(x: i32, y: i32, scroll_x: i32, scroll_y: i32) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    // Move mouse to position first
    enigo.move_mouse(x, y, enigo::Coordinate::Abs).map_err(|e| e.to_string())?;
    
    // Perform scroll
    enigo.scroll(scroll_x, enigo::Axis::Horizontal).map_err(|e| e.to_string())?;
    enigo.scroll(scroll_y, enigo::Axis::Vertical).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn type_text(text: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    
    enigo.text(&text).map_err(|e| e.to_string())?;
    
    Ok(())
}