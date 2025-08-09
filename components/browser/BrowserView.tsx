"use client";

import useBrowsingTools from "@/hooks/useBrowsingTools.ts";
import React, { useCallback } from "react";

export default function BrowserView() {
    const { setIframe } = useBrowsingTools();

    // Use a stable callback ref to avoid timing issues with effects/StrictMode
    const setIframeRef = useCallback((node: HTMLIFrameElement | null) => {
        console.log("Setting iframe ref", node);
        setIframe(node);
    }, [setIframe]);

    return (
        <div className="relative w-full h-full bg-gray-900">
            <iframe
                ref={setIframeRef}
                title="Browser View"
                className={`absolute inset-0 w-full h-full border-0`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
        </div>
    );
}
