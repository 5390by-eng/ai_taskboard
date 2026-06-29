import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  expectOnLoginPage,
  expectOnRegisterPage,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";

test.describe("Auth navigation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test("redirects unauthenticated users from root to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    await expectOnLoginPage(page);
  });

  test("redirects authenticated users from root to dashboard", async ({ page }) => {
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);

    await loginAsTestUser(page, credentials!);
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("navigates between login and register pages", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expectOnRegisterPage(page);

    await page.getByRole("link", { name: "Sign in" }).click();
    await expectOnLoginPage(page);
  });

  test("opens forgot password from login page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();
  });

  test("allows direct access to public auth routes", async ({ page }) => {
    await page.goto("/register");
    await expectOnRegisterPage(page);

    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();

    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Set new password" })).toBeVisible();
  });
});
