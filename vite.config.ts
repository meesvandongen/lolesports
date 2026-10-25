// Vite+ is only used for linting here (`vp lint`); Next.js builds the app.
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    // Roughly what next/core-web-vitals covered, plus the oxlint defaults.
    plugins: ["typescript", "unicorn", "oxc", "react", "nextjs", "jsx-a11y"],
    ignorePatterns: [".next/**", "public/**", "src/api/generated.ts"],
    // No type-aware rules: tsgolint rejects this tsconfig (target es5, moduleResolution node).
  },
});
