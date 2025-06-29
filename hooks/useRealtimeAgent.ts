import useExcalidrawTools from "@/hooks/useExcalidrawTools.ts";
import { getToken } from "@/lib/ai/getToken.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useRealtimeAgent() {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [working, setWorking] = useState(false);

    const session = useRef<RealtimeSession | null>(null);

    const tools = useExcalidrawTools();

    /* create once */
    useEffect(() => {
        // Only create a single session
        if (session.current) return;

        /* 1. Create the agent and session */
        const assistantAgent = new RealtimeAgent({
            name: "Assistant",
            instructions:
                "Use Excalidraw for any drawing-related tasks.",
            tools,
        });

        session.current = new RealtimeSession(assistantAgent, {
            model: "gpt-4o-realtime-preview-2025-06-03",
            tracingDisabled: true,
            config: {
                voice: "ash"
            }
        });

        /* 2. Wire state updates */
        session.current.on("audio_start", () => setSpeaking(true));
        session.current.on("audio_stopped", () => setSpeaking(false));
        session.current.on("error", (e) => setErrored(String(e)));
        session.current.on("agent_tool_end", (_, agent) => {
            setWorking(false);
            toast(`Returning to ${agent.name}`);
        });
        session.current.on("agent_tool_start", (_, _agent, tool) => {
            setWorking(true);
            toast(`Using ${tool.name}`);
        });

        getToken().then((token) => {
            // Aseguramos que sea una string.  
            // Si `getToken` devolvió un objeto (como en los tests),
            // intentamos extraer `session`; si no existe, usamos cadena vacía.
            const apiKey =
                typeof token === "string"
                    ? token
                    : (token as { session?: string })?.session ?? "";

            session.current?.connect({ apiKey }).then(() => {
                console.log("Connected: ", session.current?.transport);
            }).catch(setErrored);
        });

        return () => session.current?.close();
    }, [tools]);

    /* commands that UI can call */
    const mute = () => {
        session.current?.mute(true);
        console.log("Muted: ", session.current?.transport);
        setListening(false);
    };
    const unmute = () => {
        session.current?.mute(false);
        session.current?.interrupt();
        console.log("Unmuted: ", session.current?.transport);
        setListening(true);
    };
    const toggleListening = () => listening ? mute() : unmute();

    const sendMessage = (text: string) => {
        if (!text) return;
        session.current?.sendMessage(text);
    };

    return {errored, listening, speaking, toggleListening, working, sendMessage};
}
