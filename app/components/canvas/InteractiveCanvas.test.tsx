import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InteractiveCanvas from "./InteractiveCanvas";

describe("InteractiveCanvas", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    expect(getByTestId("interactive-canvas")).toBeInTheDocument();
  });

  it("calls onDraw when drawing", () => {
    const onDraw = vi.fn();
    const { getByTestId } = render(<InteractiveCanvas onDraw={onDraw} />);
    const canvas = getByTestId("interactive-canvas");

    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);

    expect(onDraw).toHaveBeenCalled();
  });

  it("does not call onDraw if not drawing", () => {
    const onDraw = vi.fn();
    const { getByTestId } = render(<InteractiveCanvas onDraw={onDraw} />);
    const canvas = getByTestId("interactive-canvas");

    fireEvent.mouseMove(canvas, { clientX: 30, clientY: 30 });

    expect(onDraw).not.toHaveBeenCalled();
  });
});
vi.mock("next/dynamic", () => ({
  default: (loader: never) => loader(),
}));
