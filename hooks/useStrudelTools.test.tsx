import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useStrudelTools from "./useStrudelTools.ts";
import { StrudelContext, StrudelEditor } from "../components/strudel/StrudelContext.tsx";

const wrapper = (editor: StrudelEditor | null) =>
  ({ children }: { children: React.ReactNode }) => (
    <StrudelContext.Provider value={{ editor, setEditor: vi.fn() }}>
      {children}
    </StrudelContext.Provider>
  );

describe("useStrudelTools", () => {
  it("evaluates code", async () => {
    const evaluate = vi.fn();
    const editor = { editor: { evaluate } } as StrudelEditor;
    const { result } = renderHook(() => useStrudelTools(), { wrapper: wrapper(editor) });
    await new Promise(r => setTimeout(r, 0));
    const [tool] = result.current;
    await tool.invoke({}, JSON.stringify({ code: "foo" }));
    expect(evaluate).toHaveBeenCalledWith("foo");
  });
});
