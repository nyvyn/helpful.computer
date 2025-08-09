"use client";

import useBrowsingTools from "@/hooks/useBrowsingTools.ts";
import { invoke } from "@tauri-apps/api/core";
import React, { useCallback, useEffect, useRef } from "react";

interface BrowserViewProps {
    isActive: boolean;
}

export default function BrowserView({isActive}: BrowserViewProps) {
    const { setIframe } = useBrowsingTools();
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const updateWebviewPosition = useCallback(() => {
        if (iframeRef.current) {
            const rect = iframeRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                console.log("Iframe viewport rect:", {x: rect.x, y: rect.y, width: rect.width, height: rect.height});

                // Send coordinates directly without adjustment
                invoke("move_browser", {
                    rect: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    }
                }).catch((error) => {
                    console.error("Failed to move browser webview:", error);
                });
            }
        }
    }, []);

    const setIframeRef = useCallback((node: HTMLIFrameElement | null) => {
        iframeRef.current = node;
        setIframe(node);
    }, [setIframe]);

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let cleanupResize: (() => void) | null = null;

        if (isActive && iframeRef.current) {
            const rect = iframeRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                // Initial show with viewport coordinates
                const showInitial = () => {
                    console.log("BrowserView is active - showing webview");

                    console.log("Initial iframe rect:", {x: rect.x, y: rect.y, width: rect.width, height: rect.height});

                    // Send coordinates directly without adjustment
                    invoke("show_browser", {
                        rect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        }
                    }).catch((error) => {
                        console.error("Failed to show browser webview:", error);
                    });
                };

                showInitial();

                // Set up ResizeObserver to track size/position changes
                resizeObserver = new ResizeObserver(() => {
                    if (isActive) {
                        updateWebviewPosition();
                    }
                });
                resizeObserver.observe(iframeRef.current);

                // Also listen for window resize events that might affect position
                const handleResize = () => {
                    if (isActive) {
                        updateWebviewPosition();
                    }
                };
                window.addEventListener('resize', handleResize);

                // Store cleanup function
                cleanupResize = () => {
                    window.removeEventListener('resize', handleResize);
                };
            }
        } else if (!isActive) {
            // Hide webview when not active
            console.log("BrowserView is not active - hiding webview");
            invoke("hide_browser").catch((error) => {
                console.error("Failed to hide browser webview:", error);
            });
        }

        // Cleanup function
        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (cleanupResize) {
                cleanupResize();
            }
            // Always hide when cleaning up
            invoke("hide_browser").catch((error) => {
                console.error("Failed to hide browser webview:", error);
            });
        };
    }, [isActive, updateWebviewPosition]);

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