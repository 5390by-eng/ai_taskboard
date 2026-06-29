import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  expectAuthStorageCleared,
  expectAuthenticated,
  expectRegistrationSuccess,
  getTestCredentials,
  loginAsTestUser,
  logoutFromApp,
  registerUser,
} from "./helpers/auth";

test.describe("Auth", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test("registers a new user when all fields are valid", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await registerUser(page, { email: uniqueEmail });
    await expectRegistrationSuccess(page, uniqueEmail);
  });

  test("logs in with a confirmed test user when credentials are valid", async ({
    page,
  }) => {
    const credentials = getTestCredentials();

    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);

    await loginAsTestUser(page, credentials!);

    await expect(page.getByText(/Welcome back!/i)).toBeVisible();
    await expectAuthenticated(page);
  });

  test("redirects unauthenticated users from protected routes to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expectAuthStorageCleared(page);
  });

  test("logs out and clears the session", async ({ page }) => {
    const credentials = getTestCredentials();

    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);

    await loginAsTestUser(page, credentials!);
    await logoutFromApp(page);
    await expectAuthStorageCleared(page);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
