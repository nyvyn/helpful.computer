"use client";

import { LazyStore } from "@tauri-apps/plugin-store";
import { MODELS } from "@/lib/models.ts";

const STORE_KEY = "openai_api_key";
const store = new LazyStore("settings.json");

export async function getOpenAIKey(): Promise<string | undefined> {
    // First check environment variable
    const envKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (envKey) {
        return envKey;
    }
    
    // Fallback to stored value
    return await store.get<string>(STORE_KEY);
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
            model: MODELS.REALTIME,
            voice: "verse",
        }),
    });
    const session = await r.json();
    return session.client_secret?.value;
}

export async function setOpenAIKey(key: string) {
    await store.set(STORE_KEY, key);
    await store.save();
}