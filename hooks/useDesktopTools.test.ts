import { renderHook } from "@testing-library/react";
import React from "react";
import useDesktopTools from "./useDesktopTools.ts";
import { describe, expect, it } from "vitest";

describe("useDesktopTools", () => {
    it("returns two tools", () => {
        const { result } = renderHook(() => useDesktopTools());
        expect(result.current.tools).toHaveLength(2);
        expect(result.current.screenshot).toBeNull();
        expect(typeof result.current.capture).toBe("function");
    });
});
