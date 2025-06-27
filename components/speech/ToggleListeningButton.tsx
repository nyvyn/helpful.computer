import { MicIcon } from "@/components/icons/MicIcon.tsx";

interface Props {
    listening: boolean;
    toggleListening: () => void;
}

export default function ToggleListeningButton({listening, toggleListening}: Props) {

    const handlePointerDown = () => {
        if (!listening) toggleListening();   // start listening while pressed
    };

    const handlePointerUp = () => {
        if (listening) toggleListening();    // stop when released
    };

    return (
        <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}     // also stop if user drags out
            className="
                cursor-pointer
                absolute bottom-4 right-4
                flex items-center justify-center
                h-12 w-12 rounded-full
                bg-blue-600 disabled:bg-blue-400
                hover:bg-blue-700 text-white
                shadow-lg transition"
        >
            {listening ? <MicIcon className="size-6 rotate-45"/> : <MicIcon className="size-6"/>}
            <span className="sr-only">
        {listening ? "Stop listening" : "Start listening"}
      </span>
        </button>
    );
}
