"use client";

import { getOpenAIKey } from "@/lib/manageOpenAIKey.ts";
import { MODELS } from "@/lib/models.ts";
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
        description: "Read the current browser page and process it according to the provided instructions.",
        parameters: z.object({
            instructions: z.string().describe("Instructions for what to extract or analyze from the page content")
        }).strict(),
        strict: true,
        execute: async ({instructions}: { instructions: string }) => {
            try {
                console.log("Reading browser content with instructions:", instructions);

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
                    model: MODELS.PLAID,
                    input: [{
                        role: "user",
                        content: [{
                            type: "input_text",
                            text: `${instructions}\n\nHTML content to process:\n\n${html}`,
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

    const interactTool = useMemo(() => tool({
        name: "Interact with Browser",
        description: "Interact with the current browser page by executing JavaScript based on the provided instructions.",
        parameters: z.object({
            instructions: z.string().describe("Instructions for how to interact with the page (e.g., click buttons, fill forms, scroll, etc.)")
        }).strict(),
        strict: true,
        execute: async ({instructions}: { instructions: string }) => {
            try {
                console.log("Generating JavaScript for browser interaction:", instructions);

                // Get current page content to understand what we're interacting with
                const html = await invoke("read_browser") as string;
                if (!html) {
                    return "No page loaded - cannot interact with browser";
                }

                const apiKey = await getOpenAIKey();
                if (!apiKey) {
                    return "OpenAI API key not set";
                }

                const openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
                
                let response;
                try {
                    response = await openai.responses.create({
                        model: MODELS.FAST,
                        input: [{
                            role: "user",
                            content: [{
                                type: "input_text",
                                text: "Generate JavaScript code to interact with the current web page based on these instructions: " + instructions + "\n\n" +
                                    "Requirements:\n" +
                                    "- Return ONLY JavaScript code, no explanation or markdown formatting\n" +
                                    "- Note: Any console.log output or return values will be ignored - this is execute-only\n" +
                                    "- Be as brief and concise as possible\n" +
                                    "- Use standard DOM methods (querySelector, click, focus, etc.)\n" +
                                    "- Base your selectors on the actual HTML structure provided below\n\n" +
                                    "Instructions: " + instructions + "\n\n" +
                                    "Current page HTML:\n" + html,
                            }],
                        }],
                    });
                } catch (apiError) {
                    console.error("OpenAI API error:", apiError);
                    return `Failed to generate JavaScript - OpenAI API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`;
                }

                const javascript = response.output_text;
                if (!javascript || javascript.trim() === "") {
                    return "Failed to generate JavaScript code - empty response from AI";
                }

                console.log("Generated JavaScript:", javascript);
                console.log("Now executing JavaScript in browser");
                await invoke("script_browser", {script: javascript});
                console.log("JavaScript executed successfully");

                return "Browser interaction completed successfully";
            } catch (err) {
                console.error("Interact with browser error:", err);
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
                    model: MODELS.CAPABLE,
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

    const tools = useMemo(() => [navigateTool, readTool, interactTool, renderTool] as const, [navigateTool, readTool, interactTool, renderTool]);

    return {tools};
}
