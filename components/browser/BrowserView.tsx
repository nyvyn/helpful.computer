"use client";

import { AppContext } from "@/components/context/AppContext.tsx";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { Webview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import React, { useContext, useEffect, useRef } from "react";

export default function BrowserView({ active }: { active: boolean }) {
    const boundingRef = useRef<HTMLDivElement>(null);
    const ctx = useContext(AppContext);

    useEffect(() => {
        const initializeWebview = async () => {
            if (!boundingRef.current) return;
            if (ctx?.browserView) return;

            // Get the current window to create the webview
            const appWindow = getCurrentWindow();
            console.log("Current window:", appWindow);
            if (!appWindow) {
                console.error("No current window found");
                return;
            }

            // Set initial bounds based on the bounding ref
            const rect = boundingRef.current.getBoundingClientRect();
            const browserView = new Webview(appWindow, "browserView", {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
            });
            console.log("Created webview:", browserView);
            ctx?.setBrowserView(browserView)
        };

        console.log("Initializing webview");
        initializeWebview().catch(console.error);
        console.log("Webview initialized");
        return () => {
            if (ctx?.browserView) {
                ctx.browserView.close().catch(console.error);
                ctx.browserView = null;
            }
        };
    }, [ctx]);

    useEffect(() => {
        const update = async () => {
            if (!boundingRef.current) return;
            if (!ctx?.browserView) return;

            const rect = boundingRef.current.getBoundingClientRect();
            await ctx.browserView.setPosition(new LogicalPosition({
                x: rect.left,
                y: rect.top,
            }));
            await ctx.browserView.setSize(new LogicalSize({
                width: rect.width,
                height: rect.height,
            }));
        };
        update().catch(console.error);
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [ctx]);

    useEffect(() => {
        const handleVisibility = async () => {
            if (!ctx?.browserView) return;

            if (active) {
                await ctx?.browserView.show();
            } else {
                await ctx?.browserView.hide();
            }
        };

        handleVisibility().catch(console.error);
    }, [active, ctx]);

    return (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-white">Browser view...</div>
        </div>
    );
}

