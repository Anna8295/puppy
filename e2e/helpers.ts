import { expect, type Page } from "@playwright/test";

/** Collects console errors and failed requests, e.g. a script blocked by the CSP or a missing image. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(`${request.failure()?.errorText}: ${request.url()}`));
  page.on("response", (response) => response.status() >= 400 && errors.push(`${response.status()}: ${response.url()}`));
  return errors;
}

export async function scrollToRail(page: Page) {
  await page.evaluate(() => {
    const rail = document.getElementById("rail")!;
    window.scrollTo({ top: rail.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
  });
}

export async function scrollToTop(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(0);
}

export const offerPopup = (page: Page) => page.getByRole("complementary", { name: "Opening offer" });
