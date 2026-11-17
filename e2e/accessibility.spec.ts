import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { offerPopup, scrollToRail } from "./helpers";

// axe checks the page against the WCAG 2.1 AA rules: contrast, labels, headings,
// keyboard access, ARIA use, and so on.
async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} element(s)`);
  expect(summary).toEqual([]);
}

test.describe("accessibility", () => {
  test("home page", async ({ page }) => {
    await page.goto("");
    await expectNoViolations(page);
  });

  test("home page with the offer pop-up open", async ({ page }) => {
    await page.goto("");
    await scrollToRail(page);
    await expect(offerPopup(page)).toBeVisible();
    await page.waitForTimeout(600); // let the slide-in finish so colours are final
    await expectNoViolations(page);
  });

  test("sign-up dialog", async ({ page }) => {
    await page.goto("");
    await page.getByLabel("Join the list for 15% off").fill("anna@example.com");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(600);
    await expectNoViolations(page);
  });

  test("privacy page", async ({ page }) => {
    await page.goto("privacy.html");
    await expectNoViolations(page);
  });

  test("the offer pop-up can be used with the keyboard alone", async ({ page }) => {
    await page.goto("");
    await scrollToRail(page);
    const popup = offerPopup(page);
    await expect(popup).toBeVisible();

    await popup.getByLabel("Your email").focus();
    await page.keyboard.type("anna@example.com");
    await page.keyboard.press("Tab");
    await expect(popup.getByRole("button", { name: "Get 15%" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
