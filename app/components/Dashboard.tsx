"use client";

import { useRealtime } from "../hooks/useRealtime.ts";
import InteractiveCanvas from "./canvas/InteractiveCanvas.tsx";
import { MicOffIcon } from "./icons/MicOffIcon.tsx";
import { MicOnIcon } from "./icons/MicOnIcon.tsx";
import AudioVisualizer from "./visualizer/AudioVisualizer";

export default function Dashboard() {
    const {listening, speaking, toggleListening} = useRealtime();

    return (
        <div className="flex w-screen h-screen bg-black">
            <div className="relative flex items-center justify-center flex-1">
                <AudioVisualizer listening={listening} speaking={speaking}/>
                <button
                    onClick={toggleListening}
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
            </div>

            <div className="flex-1">
                <InteractiveCanvas/>
            </div>
        </div>
    );
}
