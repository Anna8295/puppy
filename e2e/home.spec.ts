import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, offerPopup, scrollToRail, scrollToTop, trackErrors } from "./helpers";

test.describe("home page", () => {
  test("loads with no console errors, blocked scripts or missing files", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("");

    await expect(page).toHaveTitle(/Cord & Coat/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dressed for every walk.");
    await scrollToRail(page);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("is served with a Content-Security-Policy", async ({ page }) => {
    await page.goto("");
    const csp = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(csp).toHaveAttribute("content", /default-src 'self'/);
  });

  test("never scrolls sideways", async ({ page }) => {
    await page.goto("");
    await expectNoHorizontalScroll(page);
    await scrollToRail(page);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("hero email form", () => {
  test("refuses an invalid address", async ({ page }) => {
    await page.goto("");
    const input = page.getByLabel("Join the list for 15% off");
    await input.fill("not-an-email");
    await page.getByRole("button", { name: "Notify me" }).click();

    expect(await input.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("accepts a valid address and explains that nothing is sent", async ({ page }) => {
    await page.goto("");
    const input = page.getByLabel("Join the list for 15% off");
    await input.fill("anna@example.com");
    await page.getByRole("button", { name: "Notify me" }).click();

    const dialog = page.getByRole("dialog", { name: /no emails will be fetched/i });
    await expect(dialog).toBeVisible();
    await expect(input).toHaveValue("");

    await dialog.getByRole("button", { name: "Fair enough" }).click();
    await expect(dialog).toBeHidden();
  });

  test("dialog closes with Escape", async ({ page }) => {
    await page.goto("");
    await page.getByLabel("Join the list for 15% off").fill("anna@example.com");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("15% offer pop-up", () => {
  test("only appears once the visitor reaches the rail", async ({ page }) => {
    await page.goto("");
    await page.waitForTimeout(2000);
    await expect(offerPopup(page)).toBeHidden();

    await scrollToRail(page);
    await expect(offerPopup(page)).toBeVisible();

    await scrollToTop(page);
    await expect(offerPopup(page)).toBeHidden();
  });

  test("stays closed once closed", async ({ page }) => {
    await page.goto("");
    await scrollToRail(page);
    await offerPopup(page).getByRole("button", { name: "Close the offer" }).click();
    await expect(offerPopup(page)).toBeHidden();

    await scrollToTop(page);
    await scrollToRail(page);
    await page.waitForTimeout(2000);
    await expect(offerPopup(page)).toBeHidden();
  });

  test("doesn't ask again after signing up in the hero", async ({ page }) => {
    await page.goto("");
    await page.getByLabel("Join the list for 15% off").fill("anna@example.com");
    await page.getByRole("button", { name: "Notify me" }).click();
    await page.getByRole("button", { name: "Fair enough" }).click();

    await scrollToRail(page);
    await page.waitForTimeout(2000);
    await expect(offerPopup(page)).toBeHidden();
  });

  test("signs up from the pop-up", async ({ page }) => {
    await page.goto("");
    await scrollToRail(page);
    const popup = offerPopup(page);
    await popup.getByLabel("Your email").fill("anna@example.com");
    await popup.getByRole("button", { name: "Get 15%" }).click();

    await expect(page.getByRole("dialog")).toContainText("no 15% code");
    await page.getByRole("button", { name: "Fair enough" }).click();
    await expect(popup).toBeHidden();
  });
});

test.describe("the rail", () => {
  test("turns a piece to the front when it's hovered or tapped", async ({ page, isMobile }) => {
    await page.goto("");
    await scrollToRail(page);
    // the pop-up sits over the bottom of the rail on phones; close it first, like a visitor would
    await offerPopup(page).getByRole("button", { name: "Close the offer" }).click();

    const slicker = page.getByRole("button", { name: /rain slicker in mustard/i });
    await slicker.scrollIntoViewIfNeeded();
    if (isMobile) await slicker.tap();
    else await slicker.hover();

    await expect(slicker).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#rail [aria-live]")).toContainText("Rain Slicker");
  });
});

test.describe("navigation", () => {
  test("header link jumps to the rail", async ({ page, isMobile }) => {
    test.skip(isMobile, "the header links are hidden on phones");
    await page.goto("");
    await page.getByRole("banner").getByRole("link", { name: "The rail" }).click();
    await expect(page.getByRole("heading", { name: /five pieces for colder walks/i })).toBeInViewport();
  });

  test("footer links to the privacy page, and back", async ({ page }) => {
    await page.goto("");
    await page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }).click();

    await expect(page).toHaveURL(/privacy\.html$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The short version: we keep nothing.");

    await page.getByRole("link", { name: /back to the rail/i }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dressed for every walk.");
  });
});
