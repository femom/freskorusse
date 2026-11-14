// Vérifie que le BUILD (dossier dist/) est utilisable hors-ligne et installable.
// Usage : npm run build && npm run verify:offline
//
// Ce script ne remplace pas un test sur un vrai appareil (couper le réseau après une
// première visite), mais il détecte les erreurs classiques : un fichier oublié dans le
// cache, une ressource chargée depuis Internet, un manifest incomplet.
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const results = [];
const check = (ok, label, detail = "") => results.push({ ok, label, detail });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const rel = (f) => path.relative(DIST, f).split(path.sep).join("/");

if (!fs.existsSync(path.join(DIST, "sw.js"))) {
  console.error("dist/sw.js introuvable : lance d'abord « npm run build ».");
  process.exit(1);
}

const sw = fs.readFileSync(path.join(DIST, "sw.js"), "utf8");
const precached = new Set([...sw.matchAll(/\{url:"([^"]+)"/g)].map((m) => m[1]));

// 1. Tous les fichiers de l'app sont précachés (sauf le service worker lui-même et ses dépendances).
const files = walk(DIST).map(rel).filter((f) => f !== "sw.js" && !/^workbox-.*\.js$/.test(f) && !f.endsWith(".map"));
const missing = files.filter((f) => !precached.has(f));
check(missing.length === 0, `Les ${files.length} fichiers de l'app sont dans le cache hors-ligne`, missing.join(", "));

// 2. Tout ce que index.html charge est précaché.
const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map((m) => m[1]);
const refMissing = refs.filter((r) => !precached.has(r));
check(refs.length > 0 && refMissing.length === 0, `index.html : ${refs.length} ressources, toutes en cache`, refMissing.join(", "));

// 3. Navigation hors-ligne : toute adresse retombe sur index.html (l'app route avec #, donc suffisant).
check(/NavigationRoute/.test(sw) && /createHandlerBoundToURL\("index\.html"\)/.test(sw), "Navigation hors-ligne : retombe sur index.html");

// 4. Mises à jour : nettoyage des anciens caches + activation à la demande (message SKIP_WAITING).
check(/cleanupOutdatedCaches/.test(sw), "Les anciens fichiers sont supprimés à chaque mise à jour");
check(/SKIP_WAITING/.test(sw), "La nouvelle version attend l'ordre de l'application avant de s'activer");

// 5. Aucune ressource chargée depuis Internet par la page ou la feuille de style.
const css = walk(DIST).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(f, "utf8")).join("\n");
const external = [...(html + css).matchAll(/(?:src|href)="(https?:\/\/[^"]+)"|url\((https?:\/\/[^)]+)\)|@import\s+["']?(https?:\/\/[^"')]+)/g)];
check(external.length === 0, "Aucune police, image ou script chargé depuis Internet", external.map((m) => m[1] || m[2] || m[3]).join(", "));

// 6. Aucune requête réseau dans le code de l'application.
const srcFiles = walk("src").filter((f) => /\.(js|jsx)$/.test(f));
const network = srcFiles.filter((f) => /\bfetch\s*\(|XMLHttpRequest|new WebSocket|sendBeacon|import\(\s*["']https?:/.test(fs.readFileSync(f, "utf8")));
check(network.length === 0, "Le code de l'application ne fait aucune requête réseau", network.join(", "));

// 7. Manifest installable.
const manifest = JSON.parse(fs.readFileSync(path.join(DIST, "manifest.webmanifest"), "utf8"));
const sizes = (manifest.icons || []).map((i) => i.sizes);
check(manifest.display === "standalone" && !!manifest.start_url && !!manifest.name, "Manifest : nom, start_url et mode « standalone »");
check(sizes.includes("192x192") && sizes.includes("512x512"), "Manifest : icônes 192 et 512 px");
check((manifest.icons || []).some((i) => /maskable/.test(i.purpose || "")), "Manifest : icône « maskable » (Android)");
const iconsMissing = (manifest.icons || []).filter((i) => !precached.has(i.src.replace(/^\.\//, "")));
check(iconsMissing.length === 0, "Manifest : toutes les icônes sont en cache", iconsMissing.map((i) => i.src).join(", "));
check(/<link rel="manifest"/.test(html), "index.html déclare le manifest");

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? "OK  " : "ÉCHEC"}  ${r.label}${r.ok || !r.detail ? "" : "\n        -> " + r.detail}`);
  if (!r.ok) failed++;
}
console.log(failed ? `\n${failed} contrôle(s) en échec.` : `\nTous les contrôles passent (${results.length}).`);
process.exit(failed ? 1 : 0);
