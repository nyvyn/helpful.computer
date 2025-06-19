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
        session.on("listening", () => setListening(true));
        session.on("silent", () => setListening(false));
        session.on("speaking", () => setSpeaking(true));
        session.on("doneSpeaking", () => setSpeaking(false));
        session.on("error", (e) => setErrored(String(e)));

        /* 3. Connect with the client-secret generated on your backend */
        session.connect({apiKey: ephemeralKey}).catch(setErrored);

        return () => void session.close();
    }, [ephemeralKey]);

    /* commands that UI can call */
    const startListening = () => sessionRef.current?.mute(false);
    const stopListening = () => sessionRef.current?.mute(true);
    const mute = () => listening ? stopListening() : startListening();

    return {errored, listening, speaking, mute};
}