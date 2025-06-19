import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents-realtime";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { generateEphemeralKey } from "../lib/generateEphemeralKey.ts";

export function useRealtime() {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const sessionRef = useRef<RealtimeSession | null>(null);

    /* create once */
    useEffect(() => {
        const canvasTool = tool({
            name: "canvas",
            description: "Execute JavaScript drawing commands on the shared canvas. Provide code that uses a CanvasRenderingContext2D named `ctx`.",
            parameters: z.object({
                script: z.string(),
            }),
            execute: async ({ script }) => {
                const ctx = (globalThis as any).__aiCanvasCtx as CanvasRenderingContext2D | undefined;
                if (!ctx) throw new Error("Canvas not ready");
                new Function("ctx", script)(ctx);
                return "ok";
            },
        });

        const canvasAgent = new RealtimeAgent({ name: "Canvas", tools: [canvasTool] });
        const assistantAgent = new RealtimeAgent({ name: "Assistant" });
        assistantAgent.handoffs = [canvasAgent];
        canvasAgent.handoffs = [assistantAgent];

        const agent = assistantAgent;

        const session = new RealtimeSession(agent, {
            model: "gpt-4o-realtime-preview-2025-06-03"
        });
        sessionRef.current = session;

        /* 2. Wire state updates */
        session.on("audio_start", () => setSpeaking(true));
        session.on("audio_stopped", () => setSpeaking(false));
        session.on("error", (e) => setErrored(String(e)));
    }, []);

    /* commands that UI can call */
    const connect = () => {
        generateEphemeralKey().then(ephemeralKey => {
            sessionRef.current?.connect({apiKey: ephemeralKey.client_secret.value}).then(() => {
                setListening(true);
                console.log("Connected: ", sessionRef.current?.transport)
            }).catch(setErrored);
        });
    };
    const disconnect = () => {
        sessionRef.current?.close();
        console.log("Disconnected: ", sessionRef.current?.transport)
        setListening(false);
    };
    const toggleListening = () => listening ? disconnect() : connect();

    return {errored, listening, speaking, toggleListening};
}