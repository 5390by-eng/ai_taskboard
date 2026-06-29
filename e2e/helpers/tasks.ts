import { expect, type Page } from "@playwright/test";

export const TASK_VALIDATION_MESSAGES = {
  titleRequired: "Title is required",
} as const;

export const KANBAN_COLUMNS = [
  "Backlog",
  "Todo",
  "In Progress",
  "Review",
  "Done",
] as const;

export function uniqueTaskTitle(prefix = "e2e-task"): string {
  return `${prefix}-${Date.now()}`;
}

export async function expectKanbanColumns(page: Page): Promise<void> {
  const main = page.getByRole("main");

  for (const column of KANBAN_COLUMNS) {
    await expect(main.getByRole("heading", { name: column, exact: true })).toBeVisible();
  }
}

export async function openCreateTaskModal(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Add Task" }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Create Task" }),
  ).toBeVisible();
}

export async function submitCreateTaskForm(page: Page): Promise<void> {
  await page.getByRole("dialog").getByRole("button", { name: "Create Task" }).click();
}

export async function fillCreateTaskTitle(page: Page, title: string): Promise<void> {
  await page.getByRole("dialog").getByLabel("Title").fill(title);
}

export async function createTask(page: Page, title: string): Promise<void> {
  await openCreateTaskModal(page);
  await fillCreateTaskTitle(page, title);
  await submitCreateTaskForm(page);
  await expect(page.getByText("Task created")).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
}

export async function openTaskByTitle(page: Page, title: string): Promise<void> {
  await page.getByText(title).click();
  await expect(page.getByRole("heading", { name: "Task details" })).toBeVisible();
}

export async function expectBoardNotFound(page: Page): Promise<void> {
  await expect(page.getByText("Board not found")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
}

function taskDetailsDialog(page: Page) {
  return page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Task details" }),
  });
}

export async function expectTaskDetailsOpen(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Task details" })).toBeVisible();
}

export async function clearTaskTitleInDetails(page: Page): Promise<void> {
  const input = taskDetailsDialog(page).getByLabel("Title");
  await input.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
}

export async function submitTaskDetailsForm(page: Page): Promise<void> {
  await taskDetailsDialog(page).getByRole("button", { name: "Save" }).click();
}

export async function cancelTaskDetailsForm(page: Page): Promise<void> {
  await taskDetailsDialog(page).getByRole("button", { name: "Cancel" }).click();
}

export async function openDeleteTaskDialog(page: Page): Promise<void> {
  await taskDetailsDialog(page).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("alertdialog").getByText("Delete task?")).toBeVisible();
}

export async function cancelDeleteTaskDialog(page: Page): Promise<void> {
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click();
}

export async function closeTaskDetails(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Task details" })).not.toBeVisible();
}
