"use client";

import { AppContext } from "@/components/context/AppContext.tsx";
import React, { useCallback, useContext } from "react";

export default function BrowserView({active}: { active: boolean }) {
    const ctx = useContext(AppContext);

    // Use a stable callback ref to avoid timing issues with effects/StrictMode
    const setIframeRef = useCallback((node: HTMLIFrameElement | null) => {
        console.log("Setting iframe ref", node);
        if (node) ctx?.setBrowserView(node);
    }, [ctx]);

    return (
        <div className="relative w-full h-full bg-gray-900">
            <iframe
                ref={setIframeRef}
                title="Browser View"
                className={`absolute inset-0 w-full h-full border-0 ${active ? "block" : "hidden"}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
        </div>
    );
}
