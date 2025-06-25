import useExcalidrawTool from "@/hooks/useExcalidrawTool.ts";
import { getToken } from "@/lib/ai/getToken.ts";
import { assistantAgentInstructions } from "@/lib/ai/prompts.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useRealtimeAgent() {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const sessionRef = useRef<RealtimeSession | null>(null);

    const canvasTool = useExcalidrawTool();

    /* create once */
    useEffect(() => {
        // Only create a single session
        if (sessionRef.current) return;

        /* 1. Create the agent and session */
        const assistantAgent = new RealtimeAgent({
            name: "Assistant",
            instructions: assistantAgentInstructions,
            tools: [canvasTool],
        });

        const session = new RealtimeSession(assistantAgent, {
            model: "gpt-4o-realtime-preview-2025-06-03"
        });
        sessionRef.current = session;

        /* 2. Wire state updates */
        session.on("audio_start", () => setSpeaking(true));
        session.on("audio_stopped", () => setSpeaking(false));
        session.on("error", (e) => setErrored(String(e)));
        session.on("agent_tool_start", (_, agent, tool) => toast(`${agent.name} uses ${tool.name}`));

        getToken().then(token => {
            sessionRef.current?.connect({apiKey: token}).then(() => {
                setListening(true);
                console.log("Connected: ", sessionRef.current?.transport);
            }).catch(setErrored);
        });

        return () => sessionRef.current?.close();
    }, [canvasTool]);

    /* commands that UI can call */
    const mute = () => {
        sessionRef.current?.mute(true);
        sessionRef.current?.interrupt();
        console.log("Muted: ", sessionRef.current?.transport);
        setListening(false);
    };
    const unmute = () => {
        sessionRef.current?.mute(false);
        console.log("Unmuted: ", sessionRef.current?.transport);
        setListening(true);
    };
    const toggleListening = () => listening ? mute() : unmute();

    return {errored, listening, speaking, toggleListening};
}
