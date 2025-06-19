"use client";

import { useEffect } from "react";

import { checkMicrophonePermission, requestMicrophonePermission } from "tauri-plugin-macos-permissions-api";
import { MicOffIcon } from "./components/icons/MicOffIcon.tsx";
import { MicOnIcon } from "./components/icons/MicOnIcon.tsx";
import AudioVisualizer from "./components/visualizer/AudioVisualizer";
import { useRealtime } from "./hooks/useRealtime.ts";

export default function HomePage() {

    const clientSecret = process.env.OPENAI_API_KEY;
    if (!clientSecret) { throw new Error("OPENAI_API_KEY not set"); }

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

    const {listening, speaking, toggleListening} = useRealtime(clientSecret!);

    return (
        <div
            className="flex items-center justify-center min-h-screen min-w-screen bg-black"
        >
            <AudioVisualizer
                listening={listening}
                speaking={speaking}
            />

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
