"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useMemo } from "react";
import { z } from "zod";

/**
 * Tools to control the secondary browser view.
 */
// Singleton iframe reference that persists across hook instances
let globalIframeRef: HTMLIFrameElement | null = null;

export default function useBrowserTools() {

    const navigateTool = useMemo(() => tool({
        name: "Navigate Browser",
        description: "Open the given URL in the browser view.",
        parameters: z.object({url: z.string().describe("The URL to open")}).strict(),
        strict: true,
        execute: async ({url}: { url: string }) => {
            try {
                console.log("Navigating to:", url);
                console.log("Iframe ref:", globalIframeRef);
                if (globalIframeRef) {
                    console.log("Current iframe src:", globalIframeRef.src);
                    // Remove srcdoc attribute since it takes precedence over src
                    globalIframeRef.removeAttribute('srcdoc');
                    globalIframeRef.src = url;
                    console.log("Set iframe src to:", globalIframeRef.src);
                } else {
                    console.log("No iframe reference available");
                }
                return "ok";
            } catch (err) {
                console.error("Navigation error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    const readTool = useMemo(() => tool({
        name: "Read Browser",
        description: "Read the current browser page and return it as markdown.",
        parameters: z.object({}).strict(),
        strict: true,
        execute: async () => {
            try {
                if (!globalIframeRef) return "No browser view available";
                const iframe = globalIframeRef;
                let html: string;
                const url = iframe.src || "";
                if (iframe.srcdoc && iframe.srcdoc.trim().length) {
                    html = iframe.srcdoc;
                } else {
                    if (!url) return "No page loaded";
                    html = await fetch(url).then((r) => r.text());
                }

                const apiKey = await getOpenAIKey();
                if (!apiKey) {
                    return "OpenAI API key not set";
                }
                const openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
                const response = await openai.responses.create({
                    model: "gpt-4.1",
                    input: [{
                        role: "user",
                        content: [{
                            type: "input_text",
                            text: `Convert the following HTML to Markdown:\n\n${html}`,
                        }],
                    }],
                });

                return response.output_text;
            } catch (err) {
                console.error("Read browser error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    const displayTool = useMemo(() => tool({
        name: "Display Content",
        description: "Render provided HTML content in the browser view.",
        parameters: z.object({html: z.string().describe("HTML to display")}).strict(),
        strict: true,
        execute: async ({html}: { html: string }) => {
            try {
                // Use srcdoc to render arbitrary HTML
                if (globalIframeRef) {
                    globalIframeRef.srcdoc = html;
                }
                return "ok";
            } catch (err) {
                console.error("Display content error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    const setIframe = (iframe: HTMLIFrameElement | null) => {
        console.log("Setting iframe ref in browser tools:", iframe);
        if (iframe) {
            // Only update when we have a valid iframe, don't clear on null
            globalIframeRef = iframe;
            console.log("Iframe ref updated to:", iframe);
        } else {
            console.log("Ignoring null iframe ref to preserve existing reference");
        }
    };

    const tools = useMemo(() => [navigateTool, readTool, displayTool] as const, [navigateTool, readTool, displayTool]);

    return { tools, setIframe };
}
