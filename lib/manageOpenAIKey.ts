"use client";

import { secureStorage } from "tauri-plugin-secure-storage";

const STORE_KEY = "openai_api_key";

export async function getOpenAIKey(): Promise<string | null> {
    return await secureStorage.getItem(STORE_KEY);
}

/**
 * Request an OpenAI realtime session token.
 *
 * @returns Client secret used to authenticate realtime API requests.
 */
export async function getOpenAISessionToken(): Promise<string> {
    const apiKey = await getOpenAIKey();
    if (!apiKey) throw new Error("Missing OpenAI API key");

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-realtime-preview-2025-06-03",
            voice: "verse",
        }),
    });
    const session = await r.json();
    return session.client_secret?.value;
}

export async function setOpenAIKey(key: string) {
    await secureStorage.setItem(STORE_KEY, key);
}