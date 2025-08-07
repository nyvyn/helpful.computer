import { renderHook } from "@testing-library/react";
import React, { useContext } from "react";
import { describe, expect, it } from "vitest";
import { AppContext, AppProvider } from "./AppContext.tsx";

describe("AppContext", () => {
  it("provides null defaults", () => {
    const { result } = renderHook(() => useContext(AppContext), {
      wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
    });
    expect(result.current?.excalidrawApi).toBeNull();
    expect(result.current?.lexicalEditor).toBeNull();
  });
});
