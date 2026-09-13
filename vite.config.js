// Configuration Vite : React (JSX) + PWA (manifest + service worker).
//
// `base: "./"` fait en sorte que les chemins générés soient relatifs, pour que
// le build reste déployable depuis n'importe quel sous-dossier (ex: GitHub Pages).
//
// Le plugin PWA génère automatiquement un manifest.webmanifest et un service
// worker qui met en cache tous les fichiers de l'app (JS, CSS, HTML, icônes) :
// une fois visitée une première fois en ligne, l'app fonctionne hors connexion.
// Important : le service worker ne s'active que servi en http(s) (ou localhost),
// jamais en ouvrant le fichier directement (protocole file://).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-mask-512.png"],
      manifest: {
        name: "FreskoRusse",
        short_name: "FreskoRusse",
        description: "Cas, conjugaison, dictée et traduction russes — hors ligne.",
        lang: "fr",
        orientation: "portrait",
        theme_color: "#10151F",
        background_color: "#10151F",
        display: "standalone",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-mask-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
    }),
  ],
});
