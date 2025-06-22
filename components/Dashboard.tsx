"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRealtime } from "../hooks/useRealtime.ts";
import InteractiveCanvas from "./canvas/InteractiveCanvas.tsx";
import ToggleListeningButton from "./speech/ToggleListeningButton.tsx";
import AudioVisualizer from "./speech/AudioVisualizer";

export default function Dashboard() {
    const {listening, speaking, toggleListening} = useRealtime();

    const minSidebar = 100;          // px
    const defaultSidebar = 350;      // ancho inicial, no límite duro
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
              style={{ width: `${sidebarWidth}px` }}
            >
                <AudioVisualizer listening={listening} speaking={speaking} />

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
                <InteractiveCanvas/>
            </div>
        </div>
    );
}
