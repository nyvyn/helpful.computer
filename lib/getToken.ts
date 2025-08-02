"use server";

import { getOpenaiKey } from "@/lib/manageOpenaiKey.ts";

/**
 * Request an OpenAI realtime session token.
 *
 * @returns Client secret used to authenticate realtime API requests.
 */
export async function getToken(): Promise<string> {
    const apiKey = await getOpenaiKey();
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
