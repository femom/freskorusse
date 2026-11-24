import { describe, expect, it } from "vitest";
import fs from "node:fs";

const canonicalHost = "https://freskorusse.vercel.app/";
const html = fs.readFileSync("index.html", "utf8");
const robots = fs.readFileSync("public/robots.txt", "utf8");
const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");
const viteConfig = fs.readFileSync("vite.config.js", "utf8");
const guides = [
  { file: "alphabet-cyrillique.html", title: "Alphabet cyrillique russe : les 33 lettres" },
  { file: "cas-russes.html", title: "Les six cas russes : rôles et exemples" },
  { file: "conjugaison-russe.html", title: "Conjugaison russe : présent, passé et aspect" },
];

describe("référencement du site publié", () => {
  it("utilise le domaine public comme URL canonique et sociale", () => {
    expect(html).toContain(`<link rel="canonical" href="${canonicalHost}">`);
    expect(html).toContain(`<meta property="og:url" content="${canonicalHost}">`);
    expect(html).toContain(`<meta property="og:image" content="${canonicalHost}icon-512.png">`);
    expect(html).toContain(`<meta name="twitter:image" content="${canonicalHost}icon-512.png">`);
    expect(html).toContain(`"url": "${canonicalHost}"`);
  });

  it("annonce un sitemap qui ne référence que le domaine canonique", () => {
    expect(robots).toContain(`Sitemap: ${canonicalHost}sitemap.xml`);
    expect(sitemap).toContain(`<loc>${canonicalHost}</loc>`);
    expect(`${html}\n${robots}\n${sitemap}`).not.toContain("freskorussedist.vercel.app");
  });

  it("publie chaque guide avec un titre, une description et un canonical distincts", () => {
    guides.forEach(({ file, title }) => {
      const path = `/guides/${file}`;
      const page = fs.readFileSync(`public${path}`, "utf8");
      expect(html).toContain(`href="${path}"`);
      expect(sitemap).toContain(`<loc>${canonicalHost.slice(0, -1)}${path}</loc>`);
      expect(page).toContain(`<title>${title} | FreskoRusse</title>`);
      expect(page).toContain(`<link rel="canonical" href="${canonicalHost.slice(0, -1)}${path}">`);
      expect(page).toMatch(/<meta name="description" content="[^"]+">/);
      expect(page).toMatch(/<h1>[^<]+<\/h1>/);
      expect(page).toContain('"@type": "WebPage"');
      expect(page).toContain('href="/guides.css"');
    });
  });

  it("précache les guides HTML et leur feuille de style pour le mode hors ligne", () => {
    const precachePattern = viteConfig.match(/globPatterns:\s*\[\s*"([^"]+)"\s*\]/)?.[1];
    expect(precachePattern).toContain("html");
    expect(precachePattern).toContain("css");
  });
});
