import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  // Tests cover plain modules; the Worker and app plugins would only get in
  // their way (the Cloudflare plugin tries to start the Worker).
  plugins: process.env.VITEST
    ? []
    : [
        // The Worker doubles as TanStack Start's SSR environment.
        cloudflare({ viteEnvironment: { name: "ssr" } }),
        tanstackStart(),
        viteReact(),
      ],
  test: {
    include: ["src/**/*.test.ts"],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "react", "jsx-a11y"],
    ignorePatterns: ["dist/**", "src/api/generated.ts", "src/routeTree.gen.ts"],
  },
});
