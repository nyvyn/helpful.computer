import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { ExcalidrawContext } from "@/components/context/ExcalidrawContext.tsx";
import useCanvasStateTool from "./useCanvasStateTool.ts";

const mockElements = [{ id: '1', type: 'rectangle', x: 0, y: 0 }];

describe("useCanvasStateTool", () => {
    it("returns current scene as JSON", async () => {
        const provider = ({ children }: { children: React.ReactNode }) => (
            <ExcalidrawContext.Provider value={{ api: { getSceneElements: () => mockElements }, setApi: () => {} }}>
                {children}
            </ExcalidrawContext.Provider>
        );
        const { result } = renderHook(() => useCanvasStateTool(), { wrapper: provider });
        const output = await result.current.invoke({} as any, "{}");
        expect(output).toBe(JSON.stringify(mockElements));
    });
});
