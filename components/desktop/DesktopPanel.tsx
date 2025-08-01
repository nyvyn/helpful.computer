"use client";
import React from "react";

interface DesktopPanelProps {
    image: string | null;
    capture: () => void;
}

/**
 * Simple panel displaying a desktop screenshot.
 *
 * Shows the provided screenshot and exposes a capture button
 * to request a new one from the backend.
 */
export default function DesktopPanel({image, capture}: DesktopPanelProps) {
    return (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            {image ? (
                <img src={`data:image/png;base64,${image}`} className="max-w-full max-h-full" />
            ) : (
                <div className="text-white">No screenshot</div>
            )}
            <button
                className="absolute top-2 right-2 bg-white/20 text-white px-2 py-1 rounded"
                onClick={capture}
            >
                Capture
            </button>
        </div>
    );
}
