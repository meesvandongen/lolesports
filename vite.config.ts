import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  // Tests cover plain modules and do not need the app plugins.
  plugins: process.env.VITEST
    ? []
    : [
        tanstackStart({
          // A static site: the build prerenders one HTML shell, which Cloudflare
          // serves for every route, and the browser renders the rest.
          spa: {
            enabled: true,
            prerender: { outputPath: "/index.html" },
          },
        }),
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
