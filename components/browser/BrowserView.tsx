"use client";

import { invoke } from "@tauri-apps/api/core";
import React, { useCallback, useEffect, useRef } from "react";

interface BrowserViewProps {
    isActive: boolean;
}

export default function BrowserView({isActive}: BrowserViewProps) {
    const divRef = useRef<HTMLDivElement | null>(null);

    const updateWebviewPosition = useCallback(() => {
        if (divRef.current) {
            const rect = divRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {

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

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let cleanupResize: (() => void) | null = null;

        if (isActive && divRef.current) {
            const rect = divRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                // Initial show with viewport coordinates
                const showInitial = () => {

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
                resizeObserver.observe(divRef.current);

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
        <div className="w-full h-full border border-gray-700 bg-gray-900 flex items-center justify-center">
            <div
                ref={divRef}
                className="w-full h-full box-border"
            />
        </div>
    );
}