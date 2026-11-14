import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Config de test séparée de vite.config.js : pas besoin du plugin PWA pour tester.
export default defineConfig({
  plugins: [react()],
  // « virtual:pwa-register » n'existe que pendant un vrai build : on le remplace par un faux.
  resolve: {
    alias: { "virtual:pwa-register": fileURLToPath(new URL("./tests/mocks/pwa-register.js", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
  },
});
