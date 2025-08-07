"use client";

import { tool } from "@openai/agents-realtime";
import { z } from "zod";
import OpenAI from "openai";
import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import {
    navigateBrowser,
    displayContent,
    getBrowserUrl,
} from "@/lib/browser.ts";

/**
 * Tools to control the secondary browser view.
 */
export default function useBrowserTools() {
    const navigateTool = tool({
        name: "Navigate Browser",
        description: "Open the given URL in the browser view.",
        parameters: z.object({ url: z.string().describe("The URL to open") }).strict(),
        strict: true,
        execute: async ({ url }: { url: string }) => {
            try {
                await navigateBrowser(url);
                return "ok";
            } catch (err) {
                console.error("navigate-browser tool error:", err);
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
                const url = getBrowserUrl();
                if (!url) return "No page loaded";
                const html = await fetch(url).then((r) => r.text());

                const apiKey = await getOpenAIKey();
                if (!apiKey) {
                    return "OpenAI API key not set";
                }
                const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
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
                console.error("read-browser tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    });

    const displayTool = tool({
        name: "Display Content",
        description: "Render provided HTML content in the browser view.",
        parameters: z.object({ html: z.string().describe("HTML to display") }).strict(),
        strict: true,
        execute: async ({ html }: { html: string }) => {
            try {
                await displayContent(html);
                return "ok";
            } catch (err) {
                console.error("display-content tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    });

    return [navigateTool, readTool, displayTool] as const;
}

