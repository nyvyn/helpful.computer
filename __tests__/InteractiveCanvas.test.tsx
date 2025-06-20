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
