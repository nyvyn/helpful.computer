import useBrowsingTools from "@/hooks/useBrowsingTools.ts";
import useDrawingTools from "@/hooks/useDrawingTools.ts";
import useWritingTools from "@/hooks/useWritingTools.ts";
import { MODELS } from "@/lib/models.ts";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { useEffect, useRef } from "react";

/**
 * Create a GPT-5 powered agent with access to all tools.
 *
 * The agent acts as an orchestration layer coordinating tasks that
 * span the drawing, writing, and browsing surfaces.
 */
export default function useOrchestratorAgent() {
    const { tools: drawingTools } = useDrawingTools();
    const { tools: writingTools } = useWritingTools();
    const { tools: browserTools } = useBrowsingTools();

    const session = useRef<RealtimeSession | null>(null);

    useEffect(() => {
        const allTools = [...drawingTools, ...writingTools, ...browserTools];
        const agent = new RealtimeAgent({
            name: "Orchestrator",
            instructions:
                "Coordinate tasks across surfaces and summarize tool usage for the user.",
            tools: allTools,
        });

        session.current = new RealtimeSession(agent, {
            model: MODELS.CAPABLE,
            tracingDisabled: true,
        });
    }, [drawingTools, writingTools, browserTools]);

    return { orchestrator: session };
}
