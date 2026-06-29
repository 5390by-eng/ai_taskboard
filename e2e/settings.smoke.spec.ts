import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import { gotoSettings, gotoSettingsTab } from "./helpers/navigation";

test.describe("Settings smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("loads settings layout and profile tab", async ({ page }) => {
    await gotoSettings(page);
    await expect(page.getByText("Manage your account and preferences")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeDisabled();
  });

  test("navigates through all settings tabs", async ({ page }) => {
    await gotoSettingsTab(page, "Team");
    await expect(page.getByText("Manage team members and roles")).toBeVisible();
    await expect(page.getByRole("button", { name: "Invite Member" })).toBeVisible();

    await gotoSettingsTab(page, "Notifications");
    await expect(page.getByText("Configure how you receive notifications")).toBeVisible();
    await expect(page.getByText("Task assignments")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Preferences" })).toBeVisible();

    await gotoSettingsTab(page, "Integrations");
    await expect(page.getByText("Connect external services")).toBeVisible();
    await expect(page.getByRole("main").getByText("Telegram", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Telegram username")).toBeVisible();
  });
});
