import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { scrollToRail, trackErrors } from "./helpers";

// The tests never reach the real AI (it would spend the day's free try-ons):
// the Worker's answer is faked with one of the garment photos.
const PICTURE = readFileSync("worker/garments/blue.jpg").toString("base64");
const DOG = "public/frames/frame-01.webp";

async function fakeWorker(page: Page, body: object, status = 200) {
  const requests: string[] = [];
  await page.route(/\/try-on$/, async (route) => {
    requests.push(route.request().postData() ?? "");
    await route.fulfill({ status, json: body, headers: { "Access-Control-Allow-Origin": "*" } });
  });
  return requests;
}

async function openFittingRoom(page: Page) {
  await page.goto("");
  await scrollToRail(page);
  await page.getByRole("button", { name: /on your dog/i }).click();
  const dialog = page.getByRole("dialog", { name: /try it on your dog/i });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("fitting room", () => {
  test("allows the try-on Worker in the Content-Security-Policy, and nothing else", async ({ page }) => {
    await page.goto("");
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
    expect(csp).toMatch(/connect-src 'self' https:\/\/[a-z0-9.-]+\.workers\.dev;/);
  });

  test("dresses the dog from an uploaded photo", async ({ page }) => {
    const errors = trackErrors(page);
    const requests = await fakeWorker(page, { image: PICTURE, remaining: 2 });
    const dialog = await openFittingRoom(page);

    await expect(dialog.getByRole("button", { name: "Dress my dog" })).toBeDisabled();
    await dialog.locator('input[type="file"]').first().setInputFiles(DOG);
    await expect(dialog.getByRole("img", { name: "Your photo" })).toBeVisible();

    await dialog.locator("label", { has: page.getByRole("radio", { name: "Teddy Fleece Vest, Oat" }) }).click();
    await expect(dialog.getByRole("radio", { name: "Teddy Fleece Vest, Oat" })).toBeChecked();
    await dialog.getByRole("button", { name: "Dress my dog" }).click();

    await expect(dialog.getByRole("img", { name: /your dog wearing the teddy fleece vest/i })).toBeVisible();
    await expect(dialog.getByText("2 more try-ons left today.")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Download" })).toHaveAttribute("download", "cord-and-coat-beige.jpg");

    // the photo was redrawn as a JPEG in the browser before it was sent
    expect(requests).toHaveLength(1);
    expect(requests[0]).toContain('name="garment"\r\n\r\nbeige');
    expect(requests[0]).toContain("Content-Type: image/jpeg");
    expect(errors).toEqual([]);
  });

  test("explains when today's try-ons are used up", async ({ page }) => {
    await fakeWorker(page, { error: "visitor" }, 429);
    const dialog = await openFittingRoom(page);
    await dialog.locator('input[type="file"]').first().setInputFiles(DOG);
    await dialog.getByRole("button", { name: "Dress my dog" }).click();
    await expect(dialog.getByText(/your three try-ons for today/i)).toBeVisible();
  });

  test("passes the accessibility checks, and closes with Escape", async ({ page }) => {
    await fakeWorker(page, { image: PICTURE, remaining: 1 });
    const dialog = await openFittingRoom(page);
    await dialog.locator('input[type="file"]').first().setInputFiles(DOG);
    await dialog.getByRole("button", { name: "Dress my dog" }).click();
    await expect(dialog.getByText("One more try-on left today.")).toBeVisible();

    const results = await new AxeBuilder({ page }).include("dialog").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
