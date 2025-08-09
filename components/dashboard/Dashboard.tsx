"use client";

import BrowserView from "@/components/browser/BrowserView.tsx";
import ComputerView from "@/components/computer/ComputerView.tsx";
import ExcalidrawView from "@/components/excalidraw/ExcalidrawView.tsx";
import LexicalView from "@/components/lexical/LexicalView.tsx";
import SettingsView from "@/components/settings/SettingsView.tsx";
import AudioVisualizer from "@/components/speech/AudioVisualizer.tsx";
import ToggleListeningButton from "@/components/speech/ToggleListeningButton.tsx";
import { useRealtimeAgent, ViewType } from "@/hooks/useRealtimeAgent.ts";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

/**
 * Main application interface combining:
 * - A resizable sidebar with audio visualizer and listening controls
 * - Drawing and writing surfaces that can be toggled between
 * - Tool selection buttons in the header
 */

export default function Dashboard() {
    const {listening, speaking, toggleListening, working, view, selectView, reconnect} = useRealtimeAgent();

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
                <div className="p-1 pr-4 flex gap-2 justify-end text-sm">
                    <button
                        className={`px-2 py-1 ${view === ViewType.DRAWING ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectView(ViewType.DRAWING)}
                        aria-label="Drawing"
                    >Drawing</button>
                    <button
                        className={`px-2 py-1 ${view === ViewType.WRITING ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectView(ViewType.WRITING)}
                        aria-label="Writing"
                    >Writing</button>
                    <button
                        className={`px-2 py-1 ${view === ViewType.BROWSING ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectView(ViewType.BROWSING)}
                        aria-label="Browsing"
                    >Browser</button>
                    <button
                        className={`px-2 py-1 ${view === ViewType.COMPUTING ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectView(ViewType.COMPUTING)}
                        aria-label="Computing"
                    >Desktop</button>
                    <button
                        className={`px-2 py-1 ${view === ViewType.SETTINGS ? "text-white" : "text-gray-500"}`}
                        onClick={() => selectView(ViewType.SETTINGS)}
                        aria-label="Settings"
                    >
                        Settings
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className={clsx("absolute inset-0 pr-3 pb-3", { hidden: view !== ViewType.DRAWING })}>
                        <ExcalidrawView />
                    </div>
                    <div className={clsx("absolute inset-0 pr-3 pb-3", { hidden: view !== ViewType.WRITING })}>
                        <LexicalView />
                    </div>
                    <div className={clsx("absolute inset-0 pr-3 pb-3", { hidden: view !== ViewType.BROWSING })}>
                        <BrowserView isActive={view === ViewType.BROWSING}/>
                    </div>
                    <div className={clsx("absolute inset-0 pr-3 pb-3", { hidden: view !== ViewType.COMPUTING })}>
                        <ComputerView />
                    </div>
                    <div className={clsx("absolute inset-0 pr-3 pb-3", { hidden: view !== ViewType.SETTINGS })}>
                        <SettingsView onKeySaved={reconnect}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
