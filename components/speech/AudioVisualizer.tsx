"use client";

import clsx from "clsx";
import React from "react";

interface AudioVisualizerProps {
    listening: boolean;
    speaking: boolean;
}

export default function AudioVisualizer({listening, speaking}: AudioVisualizerProps) {
    // Default classes for the visualizer
    const baseClasses =
        "size-40 rounded-full blur-sm " + // Using blur-sm as in your latest version
        "transition-all ease-in-out duration-700 will-change-transform"; // Smoother transitions for all properties

    // Compute current visualizer state
    const state =
        !listening ? "idle" :
            speaking ? "speaking" :
                "listening";

    const stateClasses: Record<string, string> = {
        listening:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 \
           shadow-pink-500/60 shadow-2xl ring-4 ring-offset-2 ring-pink-400 \
           animate-pulse",
        speaking: "bg-none bg-green-400 shadow-green-400/50 shadow-lg animate-pulse",
        idle: "bg-none bg-slate-700 opacity-60",
    };

    return (
        <div
            className={clsx(baseClasses, stateClasses[state])}
        />
    );
}
