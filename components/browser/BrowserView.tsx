"use client";

import React, { useEffect, useRef } from "react";
import {
    setBrowserBounds,
    showBrowser,
    hideBrowser,
} from "@/lib/browser.ts";

export default function BrowserView({ active }: { active: boolean }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setBrowserBounds({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
            }).catch(console.error);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        if (active) {
            showBrowser().catch(console.error);
        } else {
            hideBrowser().catch(console.error);
        }
    }, [active]);

    return <div ref={ref} className="w-full h-full bg-white" />;
}

