"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useMemo } from "react";
import { z } from "zod";

// Module-level singleton ref - shared across all hook instances
const iframeRef = { current: null as HTMLIFrameElement | null };

/**
 * Tools to control the secondary browser view.
 */
export default function useBrowsingTools() {

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
                    // Remove srcdoc attribute since it takes precedence over src
                    iframeRef.current.removeAttribute('srcdoc');
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
                const iframe = iframeRef.current;
                if (!iframe) return "No browser view available";

                const url = iframe.src || "";
                const html =
                  iframe.srcdoc?.trim()?.length
                    ? iframe.srcdoc
                    : url
                    ? await fetch(url, { cache: "no-store" }).then(r => r.text()).catch(() => "")
                    : "";

                if (!html) return "No page loaded or cross-origin fetch blocked";

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
        console.log("Setting iframe in browser tools:", iframe);
        iframeRef.current = iframe;
    };

    const tools = useMemo(() => [navigateTool, readTool, displayTool] as const, [navigateTool, readTool, displayTool]);

    return { tools, setIframe };
}
