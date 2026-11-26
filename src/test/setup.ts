import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// Worker tests run in Node (no window): they need none of the stand-ins below.
if (typeof window !== "undefined") {
  // jsdom doesn't implement these browser APIs, so give the components simple stand-ins.

  // <dialog>: open and close by toggling the `open` attribute, like a real browser.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };

  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.animate = vi.fn() as unknown as Element["animate"];

  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver;
}
