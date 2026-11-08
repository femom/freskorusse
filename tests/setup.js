// jsdom n'implémente pas tout ce que le navigateur fournit : on comble les trous
// utilisés par l'app (dialog natif, défilement, matchMedia, voix de synthèse).
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
HTMLDialogElement.prototype.close = function () {
  if (!this.hasAttribute("open")) return;
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));

afterEach(() => {
  cleanup();
  window.location.hash = "";
  localStorage.clear();
});
