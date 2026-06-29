import { expect, type Page } from "@playwright/test";
import { gotoSettingsTab } from "./navigation";

export const SETTINGS_VALIDATION_MESSAGES = {
  nameMin: "Name must be at least 2 characters",
  teamRoleRequired: "Please select your team role",
  telegramRequired: "Telegram username is required",
  telegramFormat:
    "Use 5–32 characters: letters, numbers, underscore; must start with a letter",
} as const;

export async function gotoProfileSettings(page: Page): Promise<void> {
  await gotoSettingsTab(page, "Profile");
  await expect(page.getByLabel("Name")).not.toHaveValue("");
}

export async function gotoIntegrationsSettings(page: Page): Promise<void> {
  await gotoSettingsTab(page, "Integrations");
}

export async function setProfileNameForValidation(
  page: Page,
  name: string,
): Promise<void> {
  const nameInput = page.getByLabel("Name");
  await expect(nameInput).not.toHaveValue("");
  await nameInput.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(name, { delay: 10 });
}

export async function clearProfileName(page: Page): Promise<void> {
  await setProfileNameForValidation(page, "");
}

export async function submitProfileForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Save Changes" }).click();
}

export async function saveProfileWithName(page: Page, name: string): Promise<void> {
  await setProfileNameForValidation(page, name);
  await submitProfileForm(page);
  await expect(page.getByText("Profile saved")).toBeVisible();
}

export async function fillTelegramUsername(page: Page, username: string): Promise<void> {
  await page.getByLabel("Telegram username").fill(username);
}

export async function submitTelegramUsername(page: Page): Promise<void> {
  const addButton = page.getByRole("button", { name: "Add" });
  const updateButton = page.getByRole("button", { name: "Update" });

  if (await addButton.isVisible()) {
    await addButton.click();
    return;
  }

  await updateButton.click();
}
