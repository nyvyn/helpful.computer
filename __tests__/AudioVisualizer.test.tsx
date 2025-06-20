import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AudioVisualizer from '../app/components/speech/AudioVisualizer.tsx';

describe('AudioVisualizer', () => {
  it('shows idle state when not listening', () => {
    const { container } = render(<AudioVisualizer listening={false} speaking={false} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('bg-slate-700');
    expect(div.className).toContain('size-40');
  });

  it('shows listening state when listening', () => {
    const { container } = render(<AudioVisualizer listening={true} speaking={false} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('bg-sky-600');
  });

  it('shows speaking state when speaking', () => {
    const { container } = render(<AudioVisualizer listening={true} speaking={true} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('bg-green-400');
  });
});
