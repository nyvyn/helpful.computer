import SettingsView from "@/components/settings/SettingsView.tsx";
import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openAiKey.ts", () => ({
    getOpenAiKey: vi.fn().mockResolvedValue("test-key"),
    setOpenAiKey: vi.fn().mockResolvedValue(void 0),
}));

describe("SettingsView", () => {
    it("loads stored key and uses ComputerView background", async () => {
        const { container, findByDisplayValue } = render(<SettingsView />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain("bg-gray-900");
        await findByDisplayValue("test-key");
    });
});
