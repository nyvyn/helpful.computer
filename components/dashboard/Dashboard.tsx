"use client";

import clsx from "clsx";
import ExcalidrawCanvas from "@/components/excalidraw/ExcalidrawCanvas.tsx";
import LexicalCanvas from "@/components/lexical/LexicalCanvas.tsx";
import AudioVisualizer from "@/components/speech/AudioVisualizer.tsx";
import ToggleListeningButton from "@/components/speech/ToggleListeningButton.tsx";
import { useRealtimeAgent } from "@/hooks/useRealtimeAgent.ts";
import React, { useEffect, useRef, useState } from "react";

export default function Dashboard() {
    const {listening, speaking, toggleListening, working, surface, selectSurface} = useRealtimeAgent();

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
                className="w-1 cursor-col-resize"
                onMouseDown={() => (resizing.current = true)}
            />
            <div className="flex-1 flex flex-col">
                <div className="p-1 flex gap-2 justify-end text-sm">
                    <button
                        className={`px-2 py-1 ${surface === "draw" ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectSurface("draw")}
                    >Drawing</button>
                    <button
                        className={`px-2 py-1 ${surface === "text" ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectSurface("text")}
                    >Writing</button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className={clsx("absolute inset-0 pr-1 pb-1", { hidden: surface !== "draw" })}>
                        <ExcalidrawCanvas />
                    </div>
                    <div className={clsx("absolute inset-0 pr-1 pb-1", { hidden: surface !== "text" })}>
                        <LexicalCanvas />
                    </div>
                </div>
            </div>
        </div>
    );
}
