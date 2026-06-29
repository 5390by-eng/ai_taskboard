import { test } from "@playwright/test";
import {
  clearAuthStorage,
  expectAuthStorageCleared,
} from "./helpers/auth";
import { expectProtectedRedirect } from "./helpers/navigation";

test.describe("Dashboard exceptions", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test("redirects unauthenticated users from dashboard to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/dashboard");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from boards to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/boards");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from settings to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/settings");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from ai generator to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/ai-generator");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from ai chat to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/ai-chat");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from telegram inbox to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/telegram");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from billing to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/billing");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from billing success to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/billing/success");
    await expectAuthStorageCleared(page);
  });

  test("redirects unauthenticated users from billing cancel to login", async ({ page }) => {
    await expectProtectedRedirect(page, "/billing/cancel");
    await expectAuthStorageCleared(page);
  });
});
