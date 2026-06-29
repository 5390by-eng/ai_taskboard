import { expect, test } from "@playwright/test";
import {
  TEST_PASSWORD,
  VALIDATION_MESSAGES,
  clearAuthStorage,
  expectOnLoginPage,
  expectValidationMessages,
  fillForgotPasswordForm,
  fillResetPasswordForm,
  gotoForgotPasswordPage,
  gotoResetPasswordPage,
  submitForgotPasswordForm,
  submitResetPasswordForm,
} from "./helpers/auth";

test.describe("Auth password flows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test.describe("Forgot password", () => {
    test("shows validation error when submitted empty", async ({ page }) => {
      await gotoForgotPasswordPage(page);
      await submitForgotPasswordForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.invalidEmail]);
    });

    test("shows validation error for invalid email format", async ({ page }) => {
      await gotoForgotPasswordPage(page);
      await fillForgotPasswordForm(page, { email: "user@example" });
      await submitForgotPasswordForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.invalidEmail]);
    });

    test("submits reset request for a valid email", async ({ page }) => {
      await gotoForgotPasswordPage(page);
      await fillForgotPasswordForm(page, { email: "user@example.com" });
      await submitForgotPasswordForm(page);

      await expect(page.getByText(/reset link has been sent/i)).toBeVisible({
        timeout: 15_000,
      });
    });

    test("navigates back to sign in from forgot password", async ({ page }) => {
      await gotoForgotPasswordPage(page);
      await page.getByRole("link", { name: "Back to sign in" }).click();
      await expectOnLoginPage(page);
    });
  });

  test.describe("Reset password", () => {
    test("shows expired link message without a recovery session", async ({ page }) => {
      await gotoResetPasswordPage(page);

      await expect(
        page.getByText(/Password reset link is invalid or has expired/i),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Update password" })).toBeDisabled();
    });

    test("keeps submit disabled when passwords are filled without recovery session", async ({
      page,
    }) => {
      await gotoResetPasswordPage(page);
      await fillResetPasswordForm(page, {
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      });

      await expect(page.getByRole("button", { name: "Update password" })).toBeDisabled();
    });

    test("links to forgot password and sign in", async ({ page }) => {
      await gotoResetPasswordPage(page);

      await page.getByRole("link", { name: "Request a new reset link" }).click();
      await expect(page).toHaveURL(/\/forgot-password$/);
      await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();

      await gotoResetPasswordPage(page);
      await page.getByRole("link", { name: "Back to sign in" }).click();
      await expectOnLoginPage(page);
    });
  });
});
