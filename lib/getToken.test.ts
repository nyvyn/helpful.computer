import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openAiKey.ts", () => ({
    getOpenAiKey: vi.fn().mockResolvedValue("test-key")
}));

import { getToken } from "./getToken.ts";

describe("getToken", () => {
    it("calls OpenAI API and returns a token", async () => {
        const mockResponse = { client_secret: { value: "test" } };
        const json = vi.fn().mockResolvedValue(mockResponse);
        global.fetch = vi.fn().mockResolvedValue({json} as never);

        const result = await getToken();

        expect(fetch).toHaveBeenCalledWith("https://api.openai.com/v1/realtime/sessions", expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
                Authorization: `Bearer test-key`,
                "Content-Type": "application/json",
            })
        }));
        expect(result).toEqual("test");
    });
});
