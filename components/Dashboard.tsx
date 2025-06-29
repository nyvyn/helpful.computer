"use client";

import ExcalidrawCanvas from "@/components/excalidraw/ExcalidrawCanvas.tsx";
import AudioVisualizer from "@/components/speech/AudioVisualizer";
import TextInput from "@/components/speech/TextInput.tsx";
import ToggleListeningButton from "@/components/speech/ToggleListeningButton.tsx";
import { KeyboardIcon } from "@/components/icons/KeyboardIcon.tsx";
import { useRealtimeAgent } from "@/hooks/useRealtimeAgent.ts";
import React, { useEffect, useRef, useState } from "react";

export default function Dashboard() {
    const {listening, speaking, toggleListening, working, sendMessage} = useRealtimeAgent();

    const minSidebar = 100;
    const defaultSidebar = 350;
    const [sidebarWidth, setSidebarWidth] = useState(defaultSidebar);
    const [showInput, setShowInput] = useState(false);
    const resizing = useRef(false);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!resizing.current) return;
            setSidebarWidth(Math.max(minSidebar, e.clientX));
        };
        const stop = () => (resizing.current = false);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", stop);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", stop);
        };
    }, []);

    return (
        <div className="flex w-screen h-screen bg-black">
            <div
                className="relative flex flex-col items-center flex-none"
                style={{width: `${sidebarWidth}px`}}
            >
                <div className={showInput ? "flex items-center justify-center flex-1" : "flex items-center justify-center h-full"}>
                    <AudioVisualizer listening={listening} speaking={speaking} working={working}/>
                </div>
                {showInput && <TextInput sendMessage={sendMessage}/>} 

                <ToggleListeningButton
                    listening={listening}
                    toggleListening={toggleListening}
                />
                <button
                    onClick={() => setShowInput(v => !v)}
                    className="absolute bottom-4 left-4 flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                    <KeyboardIcon className="size-6" />
                    <span className="sr-only">Toggle text input</span>
                </button>
            </div>
            <div
                className="w-1 cursor-col-resize bg-gray-700"
                onMouseDown={() => (resizing.current = true)}
            />
            <div className="flex-1">
                <ExcalidrawCanvas/>
            </div>
        </div>
    );
}
