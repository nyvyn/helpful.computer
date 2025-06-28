"use client";

import ExcalidrawCanvas from "@/components/excalidraw/ExcalidrawCanvas.tsx";
import AudioVisualizer from "@/components/speech/AudioVisualizer";
import ToggleListeningButton from "@/components/speech/ToggleListeningButton.tsx";
import { useRealtimeAgent } from "@/hooks/useRealtimeAgent.ts";
import React, { useEffect, useRef, useState } from "react";

export default function Dashboard() {
    const {listening, speaking, toggleListening, working} = useRealtimeAgent();

    const minSidebar = 100;
    const defaultSidebar = 350;
    const [sidebarWidth, setSidebarWidth] = useState(defaultSidebar);
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
                className="relative flex items-center justify-center flex-none"
                style={{width: `${sidebarWidth}px`}}
            >
                <AudioVisualizer listening={listening} speaking={speaking} working={working}/>

                <ToggleListeningButton
                    listening={listening}
                    toggleListening={toggleListening}
                />
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
