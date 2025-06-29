import { MicOnIcon } from "@/components/icons/MicOnIcon.tsx";
import { MicOffIcon } from "@/components/icons/MicOffIcon.tsx";
import { useRef } from "react";

interface Props {
    listening: boolean;
    toggleListening: () => void;
}

export default function ToggleListeningButton({listening, toggleListening}: Props) {

    const LONG_PRESS_MS = 600; // tap-vs-hold threshold
    const timerId = useRef<NodeJS.Timeout | null>(null);
    const wasLongPress = useRef(false);

    const handlePointerDown = () => {
        wasLongPress.current = false;
        timerId.current = setTimeout(() => {
            wasLongPress.current = true;
            if (!listening) toggleListening();          // start push-to-talk
        }, LONG_PRESS_MS);
    };

    const stopLongPress = () => {
        if (timerId.current) clearTimeout(timerId.current);
        timerId.current = null;
        if (wasLongPress.current && listening) toggleListening(); // finish push-to-talk
    };

    const handleClick = () => {
        if (!wasLongPress.current) toggleListening(); // simple toggle
    };

    return (
        <button
            onPointerDown={handlePointerDown}
            onPointerUp={stopLongPress}
            onPointerLeave={stopLongPress}
            onClick={handleClick}
            className="
                cursor-pointer
                absolute bottom-3 left-3
                flex items-center justify-center
                h-12 w-12 rounded-full
                bg-blue-600 disabled:bg-blue-400
                hover:bg-blue-700 text-white
                shadow-lg transition"
        >
            {listening ? (
                <MicOnIcon className="size-6 transition-transform" />
            ) : (
                <MicOffIcon className="size-6 transition-transform" />
            )}
            <span className="sr-only">
                {listening ? "Stop listening" : "Start listening"}
            </span>
        </button>
    );
}
