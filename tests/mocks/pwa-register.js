import { vi } from "vitest";

// Faux « virtual:pwa-register » : en test il n'y a pas de service worker. On garde les
// options passées par l'app pour pouvoir simuler « nouvelle version disponible », etc.
export function registerSW(options) {
  globalThis.__pwaOptions = options;
  globalThis.__updateSW = vi.fn(async () => {});
  return globalThis.__updateSW;
}
