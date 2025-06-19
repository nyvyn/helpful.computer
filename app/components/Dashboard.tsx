"use client";

import { useRealtime } from "../hooks/useRealtime.ts";
import InteractiveCanvas from "./canvas/InteractiveCanvas.tsx";
import ToggleListeningButton from "./ToggleListeningButton.tsx";
import AudioVisualizer from "./visualizer/AudioVisualizer";

export default function Dashboard() {
    const {listening, speaking, toggleListening} = useRealtime();

    return (
        <div className="flex w-screen h-screen bg-black">
            <div className="relative flex items-center justify-center flex-1">
                <AudioVisualizer listening={listening} speaking={speaking} />

                <ToggleListeningButton
                  listening={listening}
                  toggleListening={toggleListening}
                />
            </div>

            <div className="flex-1">
                <InteractiveCanvas/>
            </div>
        </div>
    );
}
