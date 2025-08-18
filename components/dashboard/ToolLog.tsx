"use client";

import React from "react";

interface Props {
    log: string[];
}

/**
 * Display a running commentary of tools used by the agents.
 */
export default function ToolLog({ log }: Props) {
    return (
        <div className="w-full max-h-40 overflow-y-auto text-xs text-white bg-gray-900/50 rounded p-2 mt-4">
            {log.map((entry, index) => (
                <div key={index}>{entry}</div>
            ))}
        </div>
    );
}
