"use client";
import { ToolContext } from "@/components/tool/ToolContext.tsx";
import { tool } from "@openai/agents-realtime";
import { invoke } from "@tauri-apps/api/core";
import { useContext, useMemo } from "react";
import { z } from "zod";

/**
 * Provides tools for interacting with the user's desktop.
 *
 * Currently exposes:
 * - Capture Screenshot: Returns a base64 encoded PNG image of the desktop.
 * - Run AppleScript: Executes arbitrary AppleScript code on macOS.
 */
export default function useComputingTools() {
    const ctx = useContext(ToolContext);

    const captureScreenshotTool = useMemo(() => tool({
        name: "Capture Screenshot",
        description: "Capture the current desktop screenshot as a base64 encoded PNG.",
        parameters: z.object({}).strict(),
        strict: true,
        execute: async () => {
            try {
                const screenshot = await invoke<string>("capture_screenshot");
                ctx?.setScreenshot(screenshot);
                return screenshot;
            } catch (err) {
                console.error("capture-screenshot tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    const runAppleScriptTool = useMemo(() => tool({
        name: "Run AppleScript",
        description: "Execute the provided AppleScript on macOS and return its output.",
        parameters: z.object({
            script: z.string().describe("AppleScript source to execute"),
        }).strict(),
        strict: true,
        execute: async ({script}: { script: string }) => {
            try {
                return await invoke<string>("run_applescript", {script});
            } catch (err) {
                console.error("run-applescript tool error:", err);
                return err instanceof Error ? err.message : String(err);
            }
        },
    }), []);

    return [captureScreenshotTool, runAppleScriptTool];
}
