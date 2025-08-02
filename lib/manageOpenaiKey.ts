"use server";

import { secureStorage } from "tauri-plugin-secure-storage";

const STORE_KEY = "openai_api_key";

export async function setOpenaiKey(key: string) {
    await secureStorage.setItem(STORE_KEY, key);
}

export async function getOpenaiKey(): Promise<string | null> {
    return await secureStorage.getItem(STORE_KEY);
}
