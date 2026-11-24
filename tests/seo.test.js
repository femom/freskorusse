import { describe, expect, it } from "vitest";
import fs from "node:fs";

const canonicalHost = "https://freskorusse.vercel.app/";
const html = fs.readFileSync("index.html", "utf8");
const robots = fs.readFileSync("public/robots.txt", "utf8");
const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");

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
});
