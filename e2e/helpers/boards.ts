import { expect, type Page } from "@playwright/test";
import { gotoBoards } from "./navigation";

export const BOARD_VALIDATION_MESSAGES = {
  titleRequired: "Title is required",
} as const;

export function uniqueBoardTitle(prefix = "e2e-board"): string {
  return `${prefix}-${Date.now()}`;
}

export async function canCreateBoard(page: Page): Promise<boolean> {
  await gotoBoards(page);
  return page.getByText("Create Board", { exact: true }).first().isVisible();
}

export async function openFirstBoard(page: Page): Promise<string> {
  await gotoBoards(page);
  const boardLink = page.locator('a[href^="/boards/"]').first();
  await expect(boardLink).toBeVisible();
  const boardTitle =
    (await boardLink.getByRole("heading").first().textContent())?.trim() ?? "";
  await boardLink.click();
  await expect(page).toHaveURL(/\/boards\/[^/]+$/);
  await expect(page.getByRole("heading", { name: boardTitle, exact: true })).toBeVisible();
  return boardTitle;
}

export async function openCreateBoardModal(page: Page): Promise<void> {
  await gotoBoards(page);

  const createTrigger = page.getByText("Create Board", { exact: true }).first();
  await expect(createTrigger).toBeVisible({ timeout: 10_000 });
  await createTrigger.click();

  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Create Board" }),
  ).toBeVisible();
}

export async function submitCreateBoardForm(page: Page): Promise<void> {
  await page.getByRole("dialog").getByRole("button", { name: "Create Board" }).click();
}

export async function fillCreateBoardTitle(page: Page, title: string): Promise<void> {
  await page.getByRole("dialog").getByLabel("Title").fill(title);
}

export async function createBoardIfAllowed(
  page: Page,
  title: string,
): Promise<boolean> {
  if (!(await canCreateBoard(page))) {
    return false;
  }

  await openCreateBoardModal(page);
  await fillCreateBoardTitle(page, title);
  await submitCreateBoardForm(page);
  await expect(page.getByText("Board created")).toBeVisible();
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  return true;
}

export async function createBoard(page: Page, title: string): Promise<void> {
  const created = await createBoardIfAllowed(page, title);
  if (!created) {
    throw new Error("Board creation unavailable (plan limit reached)");
  }
}

export async function openBoardByTitle(page: Page, title: string): Promise<void> {
  await gotoBoards(page);
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/boards\/[^/]+$/);
}

export async function expectBoardsPageLoaded(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Boards", exact: true })).toBeVisible();
  await expect(page.getByText("Manage your project boards")).toBeVisible();
}

export async function expectBoardsEmptyState(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "No boards yet" })).toBeVisible();
  await expect(
    page.getByText("Create your first board to start organizing tasks"),
  ).toBeVisible();
}
