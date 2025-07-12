// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Entry point that delegates to the library crate.
fn main() {
    helpful_computer_lib::run()
}
