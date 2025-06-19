import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef, useState } from "react";

export function useRealtime(ephemeralKey: string) {
    const [errored, setErrored] = useState<boolean | string>(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const sessionRef = useRef<RealtimeSession | null>(null);

    /* create / connect once */
    useEffect(() => {
        /* 1. Build agent + session */
        const agent = new RealtimeAgent({
            name: "Assistant",
            instructions: "You are a helpful assistant.",
        });

        const session = new RealtimeSession(agent, {
            model: "gpt-4o-realtime-preview-2025-06-03",
        });
        sessionRef.current = session;

        /* 2. Wire state updates */
        session.on("audio_start", () => setSpeaking(true));
        session.on("audio_stopped", () => setSpeaking(false));
        session.on("error", (e) => setErrored(String(e)));
    }, [ephemeralKey]);

    /* commands that UI can call */
    const connect = () => {
        sessionRef.current?.connect({apiKey: ephemeralKey}).catch(setErrored);
        setListening(true);
    }
    const disconnect = () => {
        sessionRef.current?.close();
        setListening(false);
    }
    const toggleListening = () => listening ? disconnect() : connect();

    return {errored, listening, speaking, toggleListening};
}