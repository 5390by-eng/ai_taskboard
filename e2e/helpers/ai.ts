import { expect, type Page } from "@playwright/test";

export const AI_GENERATOR_MIN_CHARS = 10;

export async function fillProjectDescription(page: Page, text: string): Promise<void> {
  await page.getByPlaceholder(/Describe your project/i).fill(text);
}

export async function clickGenerateTasks(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Generate Tasks" }).click();
}

export async function expectGenerateTasksDisabled(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: "Generate Tasks" })).toBeDisabled();
}

export async function expectGenerateTasksEnabled(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: "Generate Tasks" })).toBeEnabled();
}

export async function expectAiGeneratorLoaded(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "AI Task Generator" })).toBeVisible();
  await expect(
    page.getByText("Describe your project and AI will break it down into actionable tasks"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project Description" })).toBeVisible();
}

export async function expectAiChatLoaded(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: "New Chat" })).toBeVisible();
  await expect(
    page.getByPlaceholder("Ask anything about your tasks and boards..."),
  ).toBeVisible();
}
