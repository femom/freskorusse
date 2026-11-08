import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Config de test séparée de vite.config.js : pas besoin du plugin PWA pour tester.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
  },
});
