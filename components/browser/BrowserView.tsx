"use client";

import useBrowsingTools from "@/hooks/useBrowsingTools.ts";
import React, { useCallback } from "react";

export default function BrowserView() {
    const { setIframe } = useBrowsingTools();

    const setIframeRef = useCallback((node: HTMLIFrameElement | null) => {
        setIframe(node);
    }, [setIframe]);

    return (
        <div className="relative w-full h-full bg-gray-900">
            <iframe
                ref={setIframeRef}
                title="Browser View"
                className="absolute inset-0 w-full h-full border-0"
                sandbox="
                    allow-scripts
                    allow-same-origin
                    allow-forms
                    allow-popups
                    allow-popups-to-escape-sandbox
                    allow-modals
                    allow-downloads
                    allow-top-navigation-by-user-activation"
                allow="
                    fullscreen; autoplay; clipboard-read; clipboard-write;
                    geolocation *; camera *; microphone *; payment *; display-capture *"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="eager"
            />
        </div>
    );
}