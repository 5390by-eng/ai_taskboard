import { expect, type Page } from "@playwright/test";

export const TEST_PASSWORD = "TestPass123!";

export const VALIDATION_MESSAGES = {
  invalidEmail: "Invalid email address",
  passwordMin: "Password must be at least 6 characters",
  nameMin: "Name must be at least 2 characters",
  teamRoleRequired: "Please select your team role",
  passwordsMismatch: "Passwords do not match",
} as const;

export type TestCredentials = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name?: string;
  email?: string;
  teamRole?: string;
  password?: string;
  confirmPassword?: string;
};

export function getTestCredentials(): TestCredentials | null {
  const email = process.env.E2E_LOGIN_EMAIL;
  const password = process.env.E2E_LOGIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export const E2E_LOGIN_SKIP_MESSAGE =
  "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD in .env or .env.e2e";

export async function clearAuthStorage(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
}

export async function gotoLoginPage(page: Page): Promise<void> {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
}

export async function gotoRegisterPage(page: Page): Promise<void> {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
}

export async function expectOnLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
}

export async function expectOnRegisterPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
}

export async function expectValidationMessages(
  page: Page,
  messages: readonly string[],
): Promise<void> {
  for (const message of messages) {
    await expect(page.getByText(message, { exact: true })).toBeVisible();
  }
}

export async function submitLoginForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function submitRegisterForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Create account" }).click();
}

export async function fillLoginForm(
  page: Page,
  values: { email?: string; password?: string },
): Promise<void> {
  if (values.email !== undefined) {
    await page.getByLabel("Email").fill(values.email);
  }

  if (values.password !== undefined) {
    await page.getByLabel("Password", { exact: true }).fill(values.password);
  }
}

export async function fillRegisterForm(
  page: Page,
  values: RegisterFormValues,
): Promise<void> {
  if (values.name !== undefined) {
    await page.getByLabel("Name").fill(values.name);
  }

  if (values.teamRole !== undefined) {
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: values.teamRole }).click();
  }

  if (values.email !== undefined) {
    await page.getByLabel("Email").fill(values.email);
  }

  if (values.password !== undefined) {
    await page.getByLabel("Password", { exact: true }).fill(values.password);
  }

  if (values.confirmPassword !== undefined) {
    await page.getByLabel("Confirm Password").fill(values.confirmPassword);
  }
}

export async function loginAsTestUser(
  page: Page,
  credentials: TestCredentials,
): Promise<void> {
  await gotoLoginPage(page);

  await fillLoginForm(page, credentials);
  await submitLoginForm(page);

  await expectAuthenticated(page);
}

export async function expectAuthenticated(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();

  const hasSession = await page.evaluate(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      return false;
    }

    const parsed = JSON.parse(authStorage) as {
      state?: { session?: { accessToken?: string } };
    };

    return Boolean(parsed.state?.session?.accessToken);
  });

  expect(hasSession).toBe(true);
}

export async function expectAuthStorageCleared(page: Page): Promise<void> {
  const hasSession = await page.evaluate(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      return false;
    }

    const parsed = JSON.parse(authStorage) as {
      state?: { session?: { accessToken?: string } | null };
    };

    return Boolean(parsed.state?.session?.accessToken);
  });

  expect(hasSession).toBe(false);
}

export async function expectRegistrationSuccess(
  page: Page,
  email: string,
): Promise<void> {
  await Promise.race([
    page.waitForURL(/\/login$/, { timeout: 15_000 }),
    page.waitForURL(/\/dashboard$/, { timeout: 15_000 }),
  ]);

  if (page.url().endsWith("/login")) {
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByText(/Check your email/i)).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expectAuthStorageCleared(page);
    return;
  }

  await expectAuthenticated(page);
  await expect(page.getByText(/Account created successfully/i)).toBeVisible();
}

export async function openUserMenu(page: Page): Promise<void> {
  await page.locator("header button.rounded-full").click();
}

export async function logoutFromApp(page: Page): Promise<void> {
  await openUserMenu(page);
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expectOnLoginPage(page);
}

export async function gotoForgotPasswordPage(page: Page): Promise<void> {
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: "Forgot password" })).toBeVisible();
}

export async function gotoResetPasswordPage(page: Page): Promise<void> {
  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { name: "Set new password" })).toBeVisible();
}

export async function submitForgotPasswordForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Send reset link" }).click();
}

export async function submitResetPasswordForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Update password" }).click();
}

export async function fillForgotPasswordForm(
  page: Page,
  values: { email?: string },
): Promise<void> {
  if (values.email !== undefined) {
    await page.getByLabel("Email").fill(values.email);
  }
}

export async function fillResetPasswordForm(
  page: Page,
  values: { password?: string; confirmPassword?: string },
): Promise<void> {
  if (values.password !== undefined) {
    await page.getByLabel("New password").fill(values.password);
  }

  if (values.confirmPassword !== undefined) {
    await page.getByLabel("Confirm password").fill(values.confirmPassword);
  }
}

export async function registerUser(
  page: Page,
  options: {
    email: string;
    name?: string;
    teamRole?: string;
    password?: string;
  },
): Promise<void> {
  const {
    email,
    name = "E2E Test User",
    teamRole = "Frontend Developer",
    password = TEST_PASSWORD,
  } = options;

  await gotoRegisterPage(page);

  await fillRegisterForm(page, {
    name,
    teamRole,
    email,
    password,
    confirmPassword: password,
  });
  await submitRegisterForm(page);
}
