import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import {
  expectDashboardLoaded,
  gotoDashboard,
} from "./helpers/navigation";

test.describe("Dashboard smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("shows dashboard overview after login", async ({ page }) => {
    await gotoDashboard(page);
    await expectDashboardLoaded(page);
  });

  test("navigates to boards from quick actions", async ({ page }) => {
    await gotoDashboard(page);
    await page.getByRole("link", { name: "View Boards" }).click();
    await expect(page).toHaveURL(/\/boards$/);
    await expect(page.getByRole("heading", { name: "Boards", exact: true })).toBeVisible();
  });
});
