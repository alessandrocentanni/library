import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "**/index.ts"],
    },
    hookTimeout: 60000, // we're using mongodb in-memory server for integration tests, and with the replication set, it takes a while to start. can be improved
    globals: true,
    restoreMocks: true,
  },
  plugins: [tsconfigPaths()],
});
