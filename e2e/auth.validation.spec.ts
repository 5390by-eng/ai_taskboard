import { test } from "@playwright/test";
import {
  TEST_PASSWORD,
  VALIDATION_MESSAGES,
  clearAuthStorage,
  expectOnLoginPage,
  expectOnRegisterPage,
  expectValidationMessages,
  fillLoginForm,
  fillRegisterForm,
  gotoLoginPage,
  gotoRegisterPage,
  submitLoginForm,
  submitRegisterForm,
} from "./helpers/auth";

test.describe("Auth validation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test.describe("Login form", () => {
    test("shows validation errors when submitted empty", async ({ page }) => {
      await gotoLoginPage(page);
      await submitLoginForm(page);

      await expectValidationMessages(page, [
        VALIDATION_MESSAGES.invalidEmail,
        VALIDATION_MESSAGES.passwordMin,
      ]);
      await expectOnLoginPage(page);
    });

    test("shows validation error for invalid email format", async ({ page }) => {
      await gotoLoginPage(page);
      await fillLoginForm(page, {
        email: "user@example",
        password: TEST_PASSWORD,
      });
      await submitLoginForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.invalidEmail]);
      await expectOnLoginPage(page);
    });

    test("shows validation error for short password", async ({ page }) => {
      await gotoLoginPage(page);
      await fillLoginForm(page, {
        email: "user@example.com",
        password: "12345",
      });
      await submitLoginForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.passwordMin]);
      await expectOnLoginPage(page);
    });
  });

  test.describe("Register form", () => {
    test("shows validation errors when submitted empty", async ({ page }) => {
      await gotoRegisterPage(page);
      await submitRegisterForm(page);

      await expectValidationMessages(page, [
        VALIDATION_MESSAGES.nameMin,
        VALIDATION_MESSAGES.invalidEmail,
        VALIDATION_MESSAGES.teamRoleRequired,
        VALIDATION_MESSAGES.passwordMin,
      ]);
      await expectOnRegisterPage(page);
    });

    test("shows validation error for short name", async ({ page }) => {
      await gotoRegisterPage(page);
      await fillRegisterForm(page, {
        name: "A",
        email: "user@example.com",
        teamRole: "Frontend Developer",
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      });
      await submitRegisterForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.nameMin]);
      await expectOnRegisterPage(page);
    });

    test("shows validation error when team role is not selected", async ({
      page,
    }) => {
      await gotoRegisterPage(page);
      await fillRegisterForm(page, {
        name: "E2E Test User",
        email: "user@example.com",
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      });
      await submitRegisterForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.teamRoleRequired]);
      await expectOnRegisterPage(page);
    });

    test("shows validation error when passwords do not match", async ({ page }) => {
      await gotoRegisterPage(page);
      await fillRegisterForm(page, {
        name: "E2E Test User",
        email: "user@example.com",
        teamRole: "Frontend Developer",
        password: TEST_PASSWORD,
        confirmPassword: "DifferentPass123!",
      });
      await submitRegisterForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.passwordsMismatch]);
      await expectOnRegisterPage(page);
    });

    test("shows validation error for short password", async ({ page }) => {
      await gotoRegisterPage(page);
      await fillRegisterForm(page, {
        name: "E2E Test User",
        email: "user@example.com",
        teamRole: "Frontend Developer",
        password: "12345",
        confirmPassword: "12345",
      });
      await submitRegisterForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.passwordMin]);
      await expectOnRegisterPage(page);
    });

    test("shows validation error for invalid email format", async ({ page }) => {
      await gotoRegisterPage(page);
      await fillRegisterForm(page, {
        name: "E2E Test User",
        email: "user@example",
        teamRole: "Frontend Developer",
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      });
      await submitRegisterForm(page);

      await expectValidationMessages(page, [VALIDATION_MESSAGES.invalidEmail]);
      await expectOnRegisterPage(page);
    });
  });
});
