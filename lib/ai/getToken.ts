"use server"

export async function getToken(): Promise<string> {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-realtime-preview-2025-06-03",
            voice: "verse",
        }),
    });
    const session = await r.json();
    const secret =
        typeof session.client_secret === "string"
            ? session.client_secret
            : session.client_secret?.value;

    if (!secret) throw new Error("client_secret missing from OpenAI response");
    return secret;
}
