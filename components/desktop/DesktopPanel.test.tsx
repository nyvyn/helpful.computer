import DesktopPanel from "./DesktopPanel.tsx";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

describe("DesktopPanel", () => {
    it("renders placeholder when no image", () => {
        const { getByText } = render(<DesktopPanel image={null} capture={() => {}}/>);
        expect(getByText("No screenshot")).toBeTruthy();
    });

    it("calls capture handler", () => {
        const capture = vi.fn();
        const { getByText } = render(<DesktopPanel image={null} capture={capture}/>);
        fireEvent.click(getByText("Capture"));
        expect(capture).toHaveBeenCalled();
    });
});
