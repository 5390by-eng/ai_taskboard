import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  expectValidationMessages,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import {
  gotoIntegrationsSettings,
  gotoProfileSettings,
  fillTelegramUsername,
  setProfileNameForValidation,
  SETTINGS_VALIDATION_MESSAGES,
  submitProfileForm,
  submitTelegramUsername,
} from "./helpers/settings";

test.describe("Settings validation", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("shows validation error for short profile name", async ({ page }) => {
    await gotoProfileSettings(page);
    await setProfileNameForValidation(page, "A");
    await expect(page.getByLabel("Name")).toHaveValue("A");
    await submitProfileForm(page);

    await expectValidationMessages(page, [SETTINGS_VALIDATION_MESSAGES.nameMin]);
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  });

  test("shows validation error for empty telegram username", async ({ page }) => {
    await gotoIntegrationsSettings(page);
    await fillTelegramUsername(page, "");
    await submitTelegramUsername(page);

    await expect(page.getByText(SETTINGS_VALIDATION_MESSAGES.telegramRequired)).toBeVisible();
  });

  test("shows validation error for invalid telegram username format", async ({ page }) => {
    await gotoIntegrationsSettings(page);
    await fillTelegramUsername(page, "123");
    await submitTelegramUsername(page);

    await expect(page.getByText(SETTINGS_VALIDATION_MESSAGES.telegramFormat)).toBeVisible();
  });
});
