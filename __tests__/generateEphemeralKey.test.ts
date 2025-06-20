import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEphemeralKey } from '../app/lib/openai/generateEphemeralKey.ts';

describe('generateEphemeralKey', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls OpenAI API and returns JSON', async () => {
    const mockResponse = { session: 'test' };
    const json = vi.fn().mockResolvedValue(mockResponse);
    global.fetch = vi.fn().mockResolvedValue({ json } as any);

    process.env.NEXT_PUBLIC_OPENAI_API_KEY = 'test-key';

    const result = await generateEphemeralKey();

    expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/realtime/sessions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: `Bearer test-key`,
        'Content-Type': 'application/json',
      })
    }));
    expect(result).toEqual(mockResponse);
  });
});
