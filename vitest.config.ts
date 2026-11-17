import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Component and unit tests run in jsdom (a simulated browser in Node).
// End-to-end tests in e2e/ run in a real browser with Playwright instead.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      restoreMocks: true,
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/main.tsx", "src/vite-env.d.ts"],
        reporter: ["text", "html"],
      },
    },
  })
);
