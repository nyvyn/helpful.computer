import useComputingTools from "@/hooks/useComputingTools.ts";
import useDrawingTools from "@/hooks/useDrawingTools.ts";
import useWritingTools from "@/hooks/useWritingTools.ts";

import { AppContext } from "@/components/context/AppContext.tsx";
import { getOpenAIKey, getOpenAISessionToken } from "@/lib/manageOpenAIKey.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

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
    const ctx = useContext(AppContext);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [working, setWorking] = useState(false);
    const [view, setView] = useState<ViewType>(ViewType.DRAWING);

    const session = useRef<RealtimeSession | null>(null);

    const drawingTools = useDrawingTools();
    const writingTools = useWritingTools();
    const computingTools = useComputingTools();

    const createSession = useCallback(async () => {
        console.log("Creating session");

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

        session.current.on("audio_start", () => setSpeaking(true));
        session.current.on("audio_stopped", () => setSpeaking(false));
        session.current.on("error", (e) => ctx?.setErrored(String(e)));
        session.current.on("agent_tool_end", () => {
            setWorking(false);
        });
        session.current.on("agent_tool_start", (_, _agent, tool) => {
            setWorking(true);

            if (writingTools.map(t => t.name).includes(tool.name)) setView(ViewType.WRITING);
            else if (drawingTools.map(t => t.name).includes(tool.name)) setView(ViewType.DRAWING);
            else if (computingTools.map(t => t.name).includes(tool.name)) setView(ViewType.COMPUTING);
        });

        const openAIKey = await getOpenAIKey();
        if (!openAIKey) {
            ctx?.setErrored("OpenAI api key not set.");
            setView(ViewType.SETTINGS);
            return;
        }

        const token = await getOpenAISessionToken();
        if (!token) {
            ctx?.setErrored("OpenAI api key may be incorrect.");
            setView(ViewType.SETTINGS);
            return;
        }
        await session.current.connect({
            apiKey: token
        });
        session.current.mute(true);
        console.log("Connected: ", session.current.transport);
    }, [drawingTools, writingTools, computingTools, ctx]);

    /* create once */
    useEffect(() => {
        // Only create a single session
        if (session.current) return;

        createSession().catch(ctx?.setErrored);

        return () => session.current?.close();
    }, [createSession, ctx]);

    /* commands that UI can call */
    const mute = () => {
        if (session.current?.transport.status !== "connected") {
            ctx?.setErrored("Session not connected. Verify key set.");
            return;
        }

        session.current?.mute(true);
        console.log("Muted: ", session.current?.transport);
        setListening(false);
    };
    const unmute = () => {
        if (session.current?.transport.status !== "connected") {
            ctx?.setErrored("Session not connected. Verify key set.");
            return;
        }

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
            ctx?.setErrored(false);
            setListening(false);
            setSpeaking(false);
            setWorking(false);

            console.log("Reconnecting session");

            await createSession();
        } catch (error) {
            console.error("Reconnection failed:", error);
            ctx?.setErrored(String(error));
        }
    };

    return {
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
