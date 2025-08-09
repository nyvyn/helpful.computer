"use client";

import useBrowsingTools from "@/hooks/useBrowsingTools.ts";
import React, { useCallback, useRef } from "react";
import { toast } from "sonner";

export default function BrowserView() {
    const { setIframe } = useBrowsingTools();
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // Use a stable callback ref to avoid timing issues with effects/StrictMode
    const setIframeRef = useCallback((node: HTMLIFrameElement | null) => {
        console.log("Setting iframe ref", node);
        iframeRef.current = node;
        setIframe(node);

        if (node) {
            let loadTimeout: NodeJS.Timeout;
            let errorShown = false;

            // Add error event listeners
            const handleError = () => {
                clearTimeout(loadTimeout);
                toast.error("Failed to load webpage - connection error or invalid URL");
            };

            // Listen for console errors that indicate frame blocking
            const originalConsoleError = console.error;
            const consoleErrorHandler = (...args: unknown[]) => {
                const message = args.join(' ');
                if (!errorShown && node.src && 
                    (message.includes('X-Frame-Options') || 
                     message.includes('Refused to display') ||
                     message.includes('Sandbox access violation'))) {
                    errorShown = true;
                    const hostname = new URL(node.src).hostname;
                    toast.error(`Cannot display "${hostname}" - site blocks frame embedding`);
                }
                originalConsoleError.apply(console, args);
            };
            console.error = consoleErrorHandler;

            const handleLoad = () => {
                clearTimeout(loadTimeout);
                // Check for frame blocking after a short delay
                setTimeout(() => {
                    const src = node.src;
                    if (!src || !src.startsWith('http') || errorShown) return;

                    try {
                        // Try to access contentWindow - this will throw if blocked by X-Frame-Options
                        const win = node.contentWindow;
                        if (win) {
                            // Try to access location - this is more reliable for detecting frame blocking
                            void win.location.href;
                        }
                    } catch (error) {
                        // Check if it's specifically a frame access error
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        if (errorMsg.includes('Blocked') || errorMsg.includes('Sandbox') || 
                            errorMsg.includes('frame') || errorMsg.includes('access')) {
                            errorShown = true;
                            const hostname = new URL(src).hostname;
                            toast.error(`Cannot display "${hostname}" - site blocks frame embedding`);
                        }
                    }

                    // Additional check: if the contentDocument is null and it's been a while,
                    // it might be blocked (though this is less reliable)
                    try {
                        if (!errorShown && !node.contentDocument && src.startsWith('https://')) {
                            // This is a potential indicator of blocking for HTTPS sites
                            const hostname = new URL(src).hostname;
                            // Only show this for well-known sites that typically block frames
                            if (['google.com', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'].includes(hostname) ||
                                hostname.includes('google.') || hostname.includes('facebook.') || 
                                hostname.includes('twitter.') || hostname.includes('instagram.')) {
                                errorShown = true;
                                toast.error(`Cannot display "${hostname}" - site blocks frame embedding`);
                            }
                        }
                    } catch {
                        // Ignore this check if it fails
                    }
                }, 500); // Give it more time to potentially show blocking
            };

            const handleSrcChange = () => {
                errorShown = false; // Reset error flag for new URL
                const src = node.src;
                if (src && src.startsWith('http')) {
                    // Set a timeout to detect if the frame never loads
                    loadTimeout = setTimeout(() => {
                        if (errorShown) return; // Don't show timeout if we already showed frame blocking error
                        try {
                            // If we can't access contentDocument and no load event fired, it might be blocked
                            if (!node.contentDocument) {
                                toast.error(`Timeout loading "${new URL(src).hostname}" - may not allow frame embedding`);
                            }
                        } catch {
                            // This is expected for cross-origin, so don't show error
                        }
                    }, 5000); // 5 second timeout
                }
            };

            node.addEventListener("error", handleError);
            node.addEventListener("load", handleLoad);
            
            // Watch for src changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                        clearTimeout(loadTimeout);
                        handleSrcChange();
                    }
                });
            });
            observer.observe(node, { attributes: true, attributeFilter: ['src'] });

            // Initial src check
            if (node.src) {
                handleSrcChange();
            }

            // Cleanup listeners when node changes
            return () => {
                clearTimeout(loadTimeout);
                console.error = originalConsoleError; // Restore original console.error
                node.removeEventListener("error", handleError);
                node.removeEventListener("load", handleLoad);
                observer.disconnect();
            };
        }
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
