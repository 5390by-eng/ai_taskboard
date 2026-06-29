import { expect, type Page } from "@playwright/test";

export async function gotoDashboard(page: Page): Promise<void> {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

export async function gotoBoards(page: Page): Promise<void> {
  await page.goto("/boards");
  await expect(page.getByRole("heading", { name: "Boards", exact: true })).toBeVisible();
}

export async function gotoSettings(page: Page): Promise<void> {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
}

export async function gotoSettingsTab(
  page: Page,
  tab: "Profile" | "Team" | "Notifications" | "Integrations",
): Promise<void> {
  await gotoSettings(page);
  await page.getByRole("link", { name: tab }).click();
  await expect(page.getByRole("heading", { name: tab })).toBeVisible();
}

export async function expectProtectedRedirect(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
}

export async function expectDashboardLoaded(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Overview of your workspace")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quick Actions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Tasks" })).toBeVisible();
}

export async function gotoAiGenerator(page: Page): Promise<void> {
  await page.goto("/ai-generator");
  await expect(page.getByRole("heading", { name: "AI Task Generator" })).toBeVisible();
}

export async function gotoAiChat(page: Page): Promise<void> {
  await page.goto("/ai-chat");
  await expect(page.getByRole("button", { name: "New Chat" })).toBeVisible();
}

export async function gotoTelegram(page: Page): Promise<void> {
  await page.goto("/telegram");
  await expect(page.getByRole("heading", { name: "Telegram Inbox" })).toBeVisible();
}

export async function gotoBilling(page: Page): Promise<void> {
  await page.goto("/billing");
  await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
}

export async function gotoBillingSuccess(page: Page): Promise<void> {
  await page.goto("/billing/success");
  await expect(page.getByRole("heading", { name: "Payment successful" })).toBeVisible();
}

export async function gotoBillingCancel(page: Page): Promise<void> {
  await page.goto("/billing/cancel");
  await expect(page.getByRole("heading", { name: "Checkout canceled" })).toBeVisible();
}

export async function navigateViaSidebar(
  page: Page,
  label: (typeof APP_NAV_ITEMS)[number],
): Promise<void> {
  await page.locator("nav").getByRole("link", { name: label, exact: true }).click();
}

export const APP_NAV_ITEMS = [
  "Dashboard",
  "Boards",
  "AI Generator",
  "AI Assistant",
  "Telegram Inbox",
  "Billing",
  "Settings",
] as const;

export const APP_NAV_EXPECTATIONS: Record<
  (typeof APP_NAV_ITEMS)[number],
  { url: RegExp; heading?: string | RegExp }
> = {
  Dashboard: { url: /\/dashboard$/, heading: "Dashboard" },
  Boards: { url: /\/boards$/, heading: "Boards" },
  "AI Generator": { url: /\/ai-generator$/, heading: "AI Task Generator" },
  "AI Assistant": { url: /\/ai-chat$/ },
  "Telegram Inbox": { url: /\/telegram$/, heading: "Telegram Inbox" },
  Billing: { url: /\/billing$/, heading: "Billing" },
  Settings: { url: /\/settings$/, heading: "Settings" },
};
