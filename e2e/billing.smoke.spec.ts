import { expect, test } from "@playwright/test";
import { prepareAuthenticatedSession } from "./helpers/session";
import {
  gotoBilling,
  gotoBillingCancel,
  gotoBillingSuccess,
} from "./helpers/navigation";

test.describe("Billing smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedSession(page);
  });

  test("loads billing overview with current plan and usage", async ({ page }) => {
    await gotoBilling(page);

    const main = page.getByRole("main");
    await expect(page.getByRole("heading", { name: "Current Plan" })).toBeVisible();
    await expect(page.getByText("Manage your subscription and usage")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Usage" })).toBeVisible();
    await expect(main.getByText("Boards", { exact: true })).toBeVisible();
    await expect(main.getByText("AI Requests", { exact: true })).toBeVisible();
  });

  test("shows available plans section", async ({ page }) => {
    await gotoBilling(page);
    await expect(page.getByRole("heading", { name: "Available Plans" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue to|Buy AI requests/i }).first()).toBeVisible();
  });

  test("opens buy AI requests dialog", async ({ page }) => {
    await gotoBilling(page);
    await page.getByRole("button", { name: "Buy AI requests" }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Buy AI requests" })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("shows billing success page with back link", async ({ page }) => {
    await gotoBillingSuccess(page);
    await expect(page.getByRole("link", { name: "Back to Billing" })).toBeVisible();
  });

  test("shows billing cancel page with back link", async ({ page }) => {
    await gotoBillingCancel(page);
    await expect(page.getByText("No charges were made")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Billing" })).toBeVisible();
  });
});
