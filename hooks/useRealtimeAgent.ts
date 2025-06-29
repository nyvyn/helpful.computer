import useExcalidrawTools from "@/hooks/useExcalidrawTools.ts";
import useLexicalTools from "@/hooks/useLexicalTools.ts";
import { getToken } from "@/lib/ai/getToken.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef, useState } from "react";

export function useRealtimeAgent() {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [working, setWorking] = useState(false);
    const [surface, setSurface] = useState<"draw" | "text">("draw");

    const session = useRef<RealtimeSession | null>(null);

    const excalidrawTools = useExcalidrawTools();
    const lexicalTools = useLexicalTools();

    /* create once */
    useEffect(() => {
        // Only create a single session
        if (session.current) return;

        console.log("Creating session");

        /* 1. Create the agent and session */
        const assistantAgent = new RealtimeAgent({
            name: "Assistant",
            instructions:
                "If you are asked to draw something, don't say it; instead use Drawing tools.\n" +
                "If you are asked to write something, don't say it; instead use the Writing tools.\n",
            tools: [...excalidrawTools, ...lexicalTools],
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
        session.current.on("agent_tool_end", () => {
            setWorking(false);
        });
        session.current.on("agent_tool_start", (_, _agent, tool) => {
            setWorking(true);

            if (lexicalTools.map(tool => tool.name).includes(tool.name)) setSurface("text");
            else if (excalidrawTools.map(tool => tool.name).includes(tool.name)) setSurface("draw");
        });

        /* 3. Connect the session */
        getToken().then((token) => {
            console.log("Token: ", token);
            session.current?.connect({apiKey: token}).then(() => {
                session.current?.mute(true);
                console.log("Connected: ", session.current?.transport);
            }).catch(setErrored);
        });

        return () => session.current?.close();
    }, [excalidrawTools, lexicalTools]);

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

    const selectSurface = (s: "draw" | "text") => setSurface(s);

    return {
        errored,
        listening,
        speaking,
        toggleListening,
        working,
        sendMessage,
        surface,
        selectSurface,
    };
}
