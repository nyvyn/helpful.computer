import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import path from "node:path"; // ← add

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
    plugins: [tsconfigPaths()],
});
