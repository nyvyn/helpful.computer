import { useRef } from "react";
import { MicOffIcon } from "@/components/icons/MicOffIcon.tsx";
import { MicOnIcon } from "@/components/icons/MicOnIcon.tsx";

interface Props {
    listening: boolean;
    toggleListening: () => void;
}

export default function ToggleListeningButton({listening, toggleListening}: Props) {
    // ─── configuration ────────────────────────────────────────────────────────────
    const HOLD_THRESHOLD = 300;                 // ms – press longer than this = PTT
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ─── handlers ─────────────────────────────────────────────────────────────────
    const handlePointerDown = () => {
      // start timer – if it expires we’re in “hold” mode and turn mic ON
      timeoutRef.current = setTimeout(() => {
        if (!listening) toggleListening();      // start listening for PTT
        timeoutRef.current = null;              // null ⇒ we’re now in hold mode
      }, HOLD_THRESHOLD);
    };

    const finishInteraction = () => {
      // QUICK TAP  → timeout still pending → toggle once
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        toggleListening();                      // toggle on / off
      }
      // HOLD → timeout already fired → stop listening when released
      else if (listening) {
        toggleListening();
      }
    };

    return (
        <button
            onPointerDown={handlePointerDown}
            onPointerUp={finishInteraction}
            onPointerLeave={finishInteraction}
            className="
        absolute bottom-4 right-4
        flex items-center justify-center
        h-12 w-12 rounded-full
        bg-blue-600 disabled:bg-blue-400
        hover:bg-blue-700 text-white
        shadow-lg transition"
        >
            {listening ? <MicOnIcon className="size-6"/> : <MicOffIcon className="size-6"/>}
            <span className="sr-only">
        {listening ? "Stop listening" : "Start listening"}
      </span>
        </button>
    );
}
