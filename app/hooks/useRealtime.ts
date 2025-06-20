import { Agent } from "@openai/agents";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef, useState } from "react";
import useCanvasTool from "@/hooks/useCanvasTool";
import { generateEphemeralKey } from "@/lib/generateEphemeralKey.ts";
import { canvasAgentInstructions } from "@/lib/prompts.ts";

export function useRealtime() {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const sessionRef = useRef<RealtimeSession | null>(null);

    const canvasTool = useCanvasTool();

    /* create once */
    useEffect(() => {
        const assistantAgent = new RealtimeAgent({name: "Assistant"});
        const canvasAgent = new Agent({
            name: "Canvas",
            model: "gpt-4.1",
            tools: [canvasTool],
            instructions: canvasAgentInstructions,
        });

        canvasAgent.handoffs = [assistantAgent];
        assistantAgent.handoffs = [canvasAgent];

        const session = new RealtimeSession(assistantAgent, {
            model: "gpt-4o-realtime-preview-2025-06-03"
        });
        sessionRef.current = session;

        /* 2. Wire state updates */
        session.on("audio_start", () => setSpeaking(true));
        session.on("audio_stopped", () => setSpeaking(false));
        session.on("error", (e) => setErrored(String(e)));
    }, [canvasTool]);

    /* commands that UI can call */
    const connect = () => {
        generateEphemeralKey().then(ephemeralKey => {
            sessionRef.current?.connect({apiKey: ephemeralKey.client_secret.value}).then(() => {
                setListening(true);
                console.log("Connected: ", sessionRef.current?.transport);
            }).catch(setErrored);
        });
    };
    const disconnect = () => {
        sessionRef.current?.close();
        console.log("Disconnected: ", sessionRef.current?.transport);
        setListening(false);
    };
    const toggleListening = () => listening ? disconnect() : connect();

    return {errored, listening, speaking, toggleListening};
}
