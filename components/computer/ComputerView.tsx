"use client";

import useComputingTools from "@/hooks/useComputingTools.ts";

/**
 * Simple panel displaying a desktop screenshot.
 *
 * Shows the provided screenshot and exposes a capture button
 * to request a new one from the backend.
 */
export default function ComputerView() {
    const {screenshot} = useComputingTools();

    return (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            {screenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${screenshot}`} className="max-w-full max-h-full" alt="screentshot"/>
            ) : (
                <div className="text-white">Idle...</div>
            )}
        </div>
    );
}
