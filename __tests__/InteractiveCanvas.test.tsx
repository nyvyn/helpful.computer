import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: React.forwardRef((_, ref) => <div ref={ref} className="excalidraw"></div>)
}));

import InteractiveCanvas from '../app/components/canvas/InteractiveCanvas.tsx';

describe('InteractiveCanvas', () => {
  it('exposes the Excalidraw API on mount', () => {
    const { container } = render(<InteractiveCanvas />);
    const div = container.firstElementChild as HTMLElement;
    // Excalidraw renders a div with class excalidraw
    expect(div.querySelector('.excalidraw')).not.toBeNull();
    expect((globalThis as any).__excalidrawAPI).toBeTruthy();
  });
});
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import InteractiveCanvas from "../app/components/canvas/InteractiveCanvas";

describe("InteractiveCanvas", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    expect(getByTestId("interactive-canvas")).toBeInTheDocument();
  });

  it("calls onDraw when drawing", () => {
    const onDraw = jest.fn();
    const { getByTestId } = render(<InteractiveCanvas onDraw={onDraw} />);
    const canvas = getByTestId("interactive-canvas");

    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);

    expect(onDraw).toHaveBeenCalled();
  });

  it("does not call onDraw if not drawing", () => {
    const onDraw = jest.fn();
    const { getByTestId } = render(<InteractiveCanvas onDraw={onDraw} />);
    const canvas = getByTestId("interactive-canvas");

    fireEvent.mouseMove(canvas, { clientX: 30, clientY: 30 });

    expect(onDraw).not.toHaveBeenCalled();
  });
});
vi.mock("next/dynamic", () => ({
  default: (loader: any) => loader(),
}));
//  (use `jest.mock` instead of `vi.mock` if you’re on Jest)
