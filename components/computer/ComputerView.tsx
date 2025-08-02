"use client";

import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { useContext } from "react";

/**
 * Simple panel displaying a desktop screenshot.
 *
 * Shows the provided screenshot and exposes a capture button
 * to request a new one from the backend.
 */
export default function ComputerView() {
    const ctx = useContext(ToolContext);

    return (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            {ctx?.screenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:image/png;base64,${ctx.screenshot}`} className="max-w-full max-h-full" alt="screentshot"/>
            ) : (
                <div className="text-white">Working...</div>
            )}
        </div>
    );
}
