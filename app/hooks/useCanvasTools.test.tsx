import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import useCanvasTools from "./useCanvasTools.ts";

describe("useCanvasTools", () => {
    it("returns canvas state", async () => {
        const api = {
            updateScene: vi.fn(),
            getSceneElements: vi.fn().mockReturnValue([{ id: 1 }]),
        } as never;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ExcalidrawContext.Provider value={{ api, setApi: vi.fn() }}>
                {children}
            </ExcalidrawContext.Provider>
        );

        const { result } = renderHook(() => useCanvasTools(), { wrapper });
        const [, stateTool] = result.current;
        const output = await stateTool.invoke({}, "{}");
        expect(output).toBe(JSON.stringify([{ id: 1 }]));
    });
});
