import useComputingTools from "@/hooks/useComputingTools.ts";
import useDrawingTools from "@/hooks/useDrawingTools.ts";
import useWritingTools from "@/hooks/useWritingTools.ts";
import useBrowsingTools from "@/hooks/useBrowsingTools.ts";

import { getOpenAIKey, getOpenAISessionToken } from "@/lib/manageOpenAIKey.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export enum ViewType {
    DRAWING = "drawing",
    WRITING = "writing",
    COMPUTING = "computing",
    BROWSING = "browsing",
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
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [working, setWorking] = useState(false);
    const [view, setView] = useState<ViewType>(ViewType.DRAWING);

    const session = useRef<RealtimeSession | null>(null);

    const { tools: drawingTools } = useDrawingTools();
    const { tools: writingTools } = useWritingTools();
    const { tools: computingTools } = useComputingTools();
    const { tools: browserTools } = useBrowsingTools();

    const createSession = useCallback(async () => {
        console.log("Creating session");
        console.log("Drawing tools:", drawingTools.length);
        console.log("Writing tools:", writingTools.length);
        console.log("Computing tools:", computingTools.length);
        console.log("Browser tools:", browserTools.length);

        const allTools = [...drawingTools, ...writingTools, ...computingTools, ...browserTools];
        console.log("Total tools:", allTools.length);

        const assistantAgent = new RealtimeAgent({
            name: "Assistant",
            instructions:
                "If you are asked to draw something, don't say it; instead use Drawing tools.\n" +
                "If you are asked to write something, don't say it; instead use the Writing tools.\n" +
                "If you are asked about the computer, dont say it; instead use the Computing tools.\n",
            tools: allTools,
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
        session.current.on("error", (e) => {
            console.error("Session error:", e);
            toast.error(String(e));
        });
        session.current.on("agent_tool_end", () => {
            setWorking(false);
        });
        session.current.on("agent_tool_start", (_, _agent, tool) => {
            setWorking(true);

            if (writingTools.map(t => t.name).includes(tool.name)) setView(ViewType.WRITING);
            else if (drawingTools.map(t => t.name).includes(tool.name)) setView(ViewType.DRAWING);
            else if (computingTools.map(t => t.name).includes(tool.name)) setView(ViewType.COMPUTING);
            else if (browserTools.map(t => t.name).includes(tool.name)) setView(ViewType.BROWSING);
        });

        const openAIKey = await getOpenAIKey();
        console.log("OpenAI key available:", !!openAIKey);
        if (!openAIKey) {
            toast.error("OpenAI api key not set.");
            setView(ViewType.SETTINGS);
            return;
        }

        console.log("Generating session token...");
        const token = await getOpenAISessionToken();
        console.log("Session token available:", !!token);
        if (!token) {
            toast.error("OpenAI api key may be incorrect.");
            setView(ViewType.SETTINGS);
            return;
        }
        
        console.log("Connecting to realtime session...");
        await session.current.connect({
            apiKey: token
        });
        
        console.log("Session connected, status:", session.current.transport.status);
        session.current.mute(true);
        console.log("Connected: ", session.current.transport);
    }, [drawingTools, writingTools, computingTools, browserTools]);

    /* create once */
    useEffect(() => {
        // Only create a single session
        if (session.current) {
            console.log("Session already exists, skipping creation");
            return;
        }

        console.log("Creating new session...");
        createSession().catch((error) => {
            console.error("Session creation failed:", error);
            toast.error(String(error));
        });

        return () => {
            console.log("Cleaning up session");
            session.current?.close();
        };
    }, [createSession]);

    /* commands that UI can call */
    const mute = () => {
        console.log("Mute called, session status:", session.current?.transport.status);
        if (!session.current || session.current.transport.status !== "connected") {
            console.log("Session not available or not connected");
            toast.error("Session not connected. Verify key set.");
            return;
        }

        session.current.mute(true);
        console.log("Muted: ", session.current.transport);
        setListening(false);
    };
    const unmute = () => {
        console.log("Unmute called, session status:", session.current?.transport.status);
        if (!session.current || session.current.transport.status !== "connected") {
            console.log("Session not available or not connected");
            toast.error("Session not connected. Verify key set.");
            return;
        }

        session.current.mute(false);
        session.current.interrupt();
        console.log("Unmuted: ", session.current.transport);
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
            setListening(false);
            setSpeaking(false);
            setWorking(false);

            console.log("Reconnecting session");

            await createSession();
        } catch (error) {
            console.error("Reconnection failed:", error);
            toast.error(String(error));
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
