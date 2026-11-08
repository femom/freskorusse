import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Consigne produit : pas de tiret cadratin (—) dans les textes français de l'app.
// Exception légitime : la ponctuation russe, où le tiret entre deux mots cyrilliques
// est correct (« борщ — суп »). Les commentaires de code ne sont pas du texte affiché.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[\s;,{(])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
const isCyrillic = (c) => /[А-Яа-яЁё]/.test(c || "");

describe("pas de tiret cadratin dans les textes français", () => {
  const files = walk("src").filter((f) => /\.(js|jsx)$/.test(f));
  files.forEach((file) => {
    it(file, () => {
      const lines = stripComments(fs.readFileSync(file, "utf8")).split("\n");
      const offenders = [];
      lines.forEach((line, i) => {
        for (let k = line.indexOf("—"); k !== -1; k = line.indexOf("—", k + 1)) {
          const before = line.slice(0, k).trimEnd().slice(-1);
          const after = line.slice(k + 1).trimStart()[0];
          if (!(isCyrillic(before) && isCyrillic(after))) offenders.push(`${file}:${i + 1}`);
        }
      });
      expect(offenders).toEqual([]);
    });
  });
});
