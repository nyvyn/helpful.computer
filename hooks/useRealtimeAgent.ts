import useComputingTools from "@/hooks/useComputingTools.ts";
import useDrawingTools from "@/hooks/useDrawingTools.ts";
import useWritingTools from "@/hooks/useWritingTools.ts";
import { getToken } from "@/lib/getToken.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef, useState } from "react";

export enum ViewType {
    DRAWING = "drawing",
    WRITING = "writing",
    COMPUTING = "computing",
    SETTINGS = "settings"
}

/**
 * Manage a single OpenAI `RealtimeSession`.
 *
 * The hook initializes the session with Excalidraw and Lexical tools,
 * connects it using a token from `getToken`, and exposes state used by
 * the dashboard UI.
 */

export function useRealtimeAgent() {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [working, setWorking] = useState(false);
    const [view, setView] = useState<ViewType>(ViewType.DRAWING);

    const session = useRef<RealtimeSession | null>(null);

    const drawingTools = useDrawingTools();
    const writingTools = useWritingTools();
    const computingTools = useComputingTools();

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
                "If you are asked to write something, don't say it; instead use the Writing tools.\n" +
                "If you are asked about the computer, dont say it; instead use the Computing tools.\n",
            tools: [...drawingTools, ...writingTools, ...computingTools],
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

            if (writingTools.map(t => t.name).includes(tool.name)) setView(ViewType.WRITING);
            else if (drawingTools.map(t => t.name).includes(tool.name)) setView(ViewType.DRAWING);
            else if (computingTools.map(t => t.name).includes(tool.name)) setView(ViewType.COMPUTING);
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
    }, [drawingTools, writingTools, computingTools]);

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

    const selectView = (s: ViewType) => setView(s);

    const reconnect = async () => {
        try {
            // Close existing session
            if (session.current) {
                session.current.close();
                session.current = null;
            }

            // Reset states
            setErrored(false);
            setListening(false);
            setSpeaking(false);
            setWorking(false);

            console.log("Reconnecting session");

            /* 1. Create the agent and session */
            const assistantAgent = new RealtimeAgent({
                name: "Assistant",
                instructions:
                    "If you are asked to draw something, don't say it; instead use Drawing tools.\n" +
                    "If you are asked to write something, don't say it; instead use the Writing tools.\n" +
                    "If you are asked about the computer, dont say it; instead use the Computing tools.\n",
                tools: [...drawingTools, ...writingTools, ...computingTools],
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

                if (writingTools.map(t => t.name).includes(tool.name)) setView(ViewType.WRITING);
                else if (drawingTools.map(t => t.name).includes(tool.name)) setView(ViewType.DRAWING);
                else if (computingTools.map(t => t.name).includes(tool.name)) setView(ViewType.COMPUTING);
            });

            /* 3. Connect the session */
            const token = await getToken();
            console.log("Token: ", token);
            await session.current.connect({apiKey: token});
            session.current.mute(true);
            console.log("Connected: ", session.current.transport);
        } catch (error) {
            console.error("Reconnection failed:", error);
            setErrored(String(error));
        }
    };

    return {
        errored,
        listening,
        speaking,
        toggleListening,
        working,
        sendMessage,
        view,
        selectView,
        reconnect,
    };
}
