import AudioVisualizer from "@/components/speech/AudioVisualizer.tsx";
import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe("AudioVisualizer", () => {
    it("shows idle state when not listening", () => {
        const {container} = render(<AudioVisualizer listening={false} speaking={false} working={false}/>);
        const div = container.firstElementChild as HTMLElement;
        expect(div.className).toContain("bg-slate-700");
        expect(div.className).toContain("size-40");
    });

    it("shows listening state when listening", () => {
        const {container} = render(<AudioVisualizer listening={true} speaking={false} working={false}/>);
        const div = container.firstElementChild as HTMLElement;
        expect(div.className).toContain("bg-sky-600");
    });

    it("shows speaking state when speaking", () => {
        const {container} = render(<AudioVisualizer listening={true} speaking={true} working={false}/>);
        const div = container.firstElementChild as HTMLElement;
        expect(div.className).toContain("bg-green-400");
    });
});
