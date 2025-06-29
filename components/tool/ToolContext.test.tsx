import { renderHook } from "@testing-library/react";
import React, { useContext } from "react";
import { describe, expect, it } from "vitest";
import { ToolContext, ToolProvider } from "./ToolContext.tsx";

describe("ToolContext", () => {
  it("provides null defaults", () => {
    const { result } = renderHook(() => useContext(ToolContext), {
      wrapper: ({ children }) => <ToolProvider>{children}</ToolProvider>,
    });
    expect(result.current?.excalidrawApi).toBeNull();
    expect(result.current?.lexicalEditor).toBeNull();
  });
});
