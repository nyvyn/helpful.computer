"use client";
import { invoke } from "@tauri-apps/api/core";
import { tool } from "@openai/agents-realtime";
import { useMemo, useState } from "react";
import { z } from "zod";

/**
 * Provides tools for interacting with the user's desktop.
 *
 * Currently exposes:
 * - Capture Screenshot: Returns a base64 encoded PNG image of the desktop.
 * - Run AppleScript: Executes arbitrary AppleScript code on macOS.
 */
export default function useDesktopTools() {
    const [screenshot, setScreenshot] = useState<string | null>(null);

    const captureScreenshotTool = useMemo(() => tool({
        name: "Capture Screenshot",
        description: "Capture the current desktop screenshot as a base64 encoded PNG.",
        parameters: z.object({}).strict(),
        strict: true,
        execute: async () => {
            try {
                return await capture();
            } catch (err) {
                console.error("capture-screenshot tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    const capture = async () => {
        const image = await invoke<string>("capture_screenshot");
        setScreenshot(image);
        return image;
    };

    const runAppleScriptTool = useMemo(() => tool({
        name: "Run AppleScript",
        description: "Execute the provided AppleScript on macOS and return its output.",
        parameters: z.object({
            script: z.string().describe("AppleScript source to execute"),
        }).strict(),
        strict: true,
        execute: async ({ script }: { script: string }) => {
            try {
                const result = await invoke<string>("run_applescript", { script });
                return result;
            } catch (err) {
                console.error("run-applescript tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    return { tools: [captureScreenshotTool, runAppleScriptTool], screenshot, capture };
}
