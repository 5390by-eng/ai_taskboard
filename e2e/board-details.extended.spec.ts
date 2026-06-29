import { expect, test } from "@playwright/test";
import { prepareAuthenticatedSession } from "./helpers/session";
import {
  createBoardIfAllowed,
  openFirstBoard,
  uniqueBoardTitle,
} from "./helpers/boards";
import {
  TASK_VALIDATION_MESSAGES,
  cancelDeleteTaskDialog,
  cancelTaskDetailsForm,
  clearTaskTitleInDetails,
  createTask,
  expectTaskDetailsOpen,
  openDeleteTaskDialog,
  openTaskByTitle,
  submitTaskDetailsForm,
  uniqueTaskTitle,
} from "./helpers/tasks";

test.describe("Board details extended", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedSession(page);
  });

  async function openBoardWithTask(page: import("@playwright/test").Page, taskTitle: string) {
    const boardTitle = uniqueBoardTitle();
    const created = await createBoardIfAllowed(page, boardTitle);

    if (created) {
      await page.getByRole("link", { name: boardTitle }).click();
    } else {
      await openFirstBoard(page);
    }

    await createTask(page, taskTitle);
    await openTaskByTitle(page, taskTitle);
  }

  test("shows validation when task title is cleared in details panel", async ({ page }) => {
    const taskTitle = uniqueTaskTitle("e2e-edit");
    await openBoardWithTask(page, taskTitle);

    await clearTaskTitleInDetails(page);
    await submitTaskDetailsForm(page);

    await expect(page.getByText(TASK_VALIDATION_MESSAGES.titleRequired)).toBeVisible();
    await expectTaskDetailsOpen(page);
  });

  test("restores task title when cancel is clicked in details panel", async ({ page }) => {
    const taskTitle = uniqueTaskTitle("e2e-cancel");
    await openBoardWithTask(page, taskTitle);

    await clearTaskTitleInDetails(page);
    await cancelTaskDetailsForm(page);

    await expect(page.getByRole("dialog").getByLabel("Title")).toHaveValue(taskTitle);
  });

  test("keeps task when delete confirmation is canceled", async ({ page }) => {
    const taskTitle = uniqueTaskTitle("e2e-delete");
    await openBoardWithTask(page, taskTitle);

    await openDeleteTaskDialog(page);
    await cancelDeleteTaskDialog(page);

    if (await page.getByRole("heading", { name: "Task details" }).isVisible()) {
      await page.keyboard.press("Escape");
    }

    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
