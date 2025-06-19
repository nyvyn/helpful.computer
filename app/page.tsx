"use client";

import { useEffect } from "react";

import { checkMicrophonePermission, requestMicrophonePermission } from "tauri-plugin-macos-permissions-api";
import { MicOffIcon } from "./components/icons/MicOffIcon.tsx";
import { MicOnIcon } from "./components/icons/MicOnIcon.tsx";
import AudioVisualizer from "./components/visualizer/AudioVisualizer";
import AICanvas from "./components/canvas/AICanvas";
import { useRealtime } from "./hooks/useRealtime.ts";

export default function HomePage() {
    useEffect(() => {
        checkMicrophonePermission().then(checkMicrophonePermission => {
            if (!checkMicrophonePermission) {
                requestMicrophonePermission().then(requestMicrophonePermission => {
                    if (!requestMicrophonePermission) {
                        alert("Microphone permission denied");
                    }
                });
            }
        });
    }, []);

    const {listening, speaking, toggleListening} = useRealtime();

    return (
        <div
            className="flex items-center justify-center min-h-screen min-w-screen bg-black"
        >
            <div className="flex gap-4">
                <AudioVisualizer
                    listening={listening}
                    speaking={speaking}
                />
                <AICanvas />
            </div>

            {/* toggle-listening button */}
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
                {listening ? (
                    <MicOnIcon className="size-6"/>
                ) : (
                    <MicOffIcon className="size-6"/>
                )}
                <span className="sr-only">
                    {listening
                        ? "Stop listening"
                        : "Start listening"
                    }
                </span>
            </button>
        </div>
    );
}
