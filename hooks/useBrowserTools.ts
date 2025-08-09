"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useMemo, useRef } from "react";
import { z } from "zod";

/**
 * Tools to control the secondary browser view.
 */
export default function useBrowserTools() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const navigateTool = useMemo(() => tool({
        name: "Navigate Browser",
        description: "Open the given URL in the browser view.",
        parameters: z.object({url: z.string().describe("The URL to open")}).strict(),
        strict: true,
        execute: async ({url}: { url: string }) => {
            try {
                console.log("Navigating to:", url);
                console.log("Iframe ref:", iframeRef.current);
                if (iframeRef.current) {
                    console.log("Current iframe src:", iframeRef.current.src);
                    // Clear srcdoc first since it takes precedence over src
                    iframeRef.current.srcdoc = "";
                    iframeRef.current.src = url;
                    console.log("Set iframe src to:", iframeRef.current.src);
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
                if (!iframeRef.current) return "No browser view available";
                const iframe = iframeRef.current;
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
                if (iframeRef.current) {
                    iframeRef.current.srcdoc = html;
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
        iframeRef.current = iframe;
    };

    const tools = useMemo(() => [navigateTool, readTool, displayTool] as const, [navigateTool, readTool, displayTool]);

    return { tools, setIframe };
}
