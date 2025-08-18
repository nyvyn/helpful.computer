import { render, screen } from "@testing-library/react";
import ToolLog from "./ToolLog.tsx";
import React from "react";
import { describe, expect, it } from "vitest";

describe("ToolLog", () => {
    it("renders log entries", () => {
        render(<ToolLog log={["Started draw", "Finished draw"]} />);
        expect(screen.getByText("Started draw")).toBeDefined();
        expect(screen.getByText("Finished draw")).toBeDefined();
    });
});
