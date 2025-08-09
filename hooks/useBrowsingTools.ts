"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { tool } from "@openai/agents-realtime";
import { invoke } from "@tauri-apps/api/core";
import OpenAI from "openai";
import { useMemo } from "react";
import { z } from "zod";

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

                await invoke("navigate_browser", {url});
                console.log("Navigated using Tauri command");
                
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
                console.log("Reading browser content");

                // Get HTML content from the webview using Tauri command
                const html = await invoke("read_browser") as string;
                console.log("Retrieved HTML content from webview");

                if (!html) return "No page loaded";

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

    const renderTool = useMemo(() => tool({
        name: "Render Content",
        description: "Create and render an HTML page based on the provided instructions.",
        parameters: z.object({instructions: z.string().describe("Instructions for creating the HTML page")}).strict(),
        strict: true,
        execute: async ({instructions}: { instructions: string }) => {
            try {
                console.log("Creating HTML content from instructions:", instructions);

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
                            text: "Create a complete, self-contained HTML file based on these instructions: " + instructions + "\n\n" +
                                "Requirements:\n" +
                                "- Include all necessary HTML, CSS, and JavaScript in a single file\n" +
                                "- Use modern, clean styling\n" +
                                "- Make it responsive and well-designed\n" +
                                "- Include any inline CSS and JavaScript needed\n" +
                                "- Return only the HTML content without any explanation or markdown formatting",
                        }],
                    }],
                });

                const html = response.output_text;
                if (!html) {
                    return "Failed to generate HTML content";
                }

                console.log("Generated HTML, now rendering in browser");
                await invoke("render_browser", {html});
                console.log("HTML content rendered using Tauri command");

                return "Successfully created and rendered HTML page";
            } catch (err) {
                console.error("Render content error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    const tools = useMemo(() => [navigateTool, readTool, renderTool] as const, [navigateTool, readTool, renderTool]);

    return {tools};
}
