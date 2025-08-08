"use client";

import { AppContext } from "@/components/context/AppContext.tsx";
import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { tool } from "@openai/agents-realtime";
import OpenAI from "openai";
import { useContext } from "react";
import { z } from "zod";

/**
 * Tools to control the secondary browser view.
 */
export default function useBrowserTools() {
    const ctx = useContext(AppContext);

    const navigateTool = tool({
        name: "Navigate Browser",
        description: "Open the given URL in the browser view.",
        parameters: z.object({url: z.string().describe("The URL to open")}).strict(),
        strict: true,
        execute: async ({url}: { url: string }) => {
            try {
                if (ctx?.browserView) ctx.browserView.src = url;
                return "ok";
            } catch (err) {
                ctx?.setErrored(err instanceof Error ? err.message : String(err));
                return err instanceof Error ? err.message : String(err);
            }
        },
    });

    const readTool = tool({
        name: "Read Browser",
        description: "Read the current browser page and return it as markdown.",
        parameters: z.object({}).strict(),
        strict: true,
        execute: async () => {
            try {
                if (!ctx?.browserView) return "No browser view available";
                const iframe = ctx?.browserView;
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
                ctx?.setErrored(err instanceof Error ? err.message : String(err));
                return err instanceof Error ? err.message : String(err);
            }
        },
    });

    const displayTool = tool({
        name: "Display Content",
        description: "Render provided HTML content in the browser view.",
        parameters: z.object({html: z.string().describe("HTML to display")}).strict(),
        strict: true,
        execute: async ({html}: { html: string }) => {
            try {
                // Use srcdoc to render arbitrary HTML
                if (ctx?.browserView) ctx.browserView.srcdoc = html;
                return "ok";
            } catch (err) {
                ctx?.setErrored(err instanceof Error ? err.message : String(err));
                return err instanceof Error ? err.message : String(err);
            }
        },
    });

    return [navigateTool, readTool, displayTool] as const;
}
