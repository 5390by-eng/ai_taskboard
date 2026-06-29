import { expect, test } from "@playwright/test";
import { prepareAuthenticatedSession } from "./helpers/session";
import { gotoTelegram } from "./helpers/navigation";

test.describe("Telegram inbox smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedSession(page);
  });

  test("loads telegram inbox page", async ({ page }) => {
    await gotoTelegram(page);
    await expect(
      page.getByText("Review and approve tasks received from Telegram"),
    ).toBeVisible();
  });

  test("shows inbox content or empty state", async ({ page }) => {
    await gotoTelegram(page);

    const emptyState = page.getByRole("heading", { name: "Inbox is empty" });
    const draftCard = page.locator('[class*="space-y-4"] > div').first();

    await expect(emptyState.or(draftCard)).toBeVisible({ timeout: 15_000 });
  });
});
