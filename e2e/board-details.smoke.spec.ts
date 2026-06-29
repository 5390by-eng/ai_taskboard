import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import {
  createBoardIfAllowed,
  openFirstBoard,
  uniqueBoardTitle,
} from "./helpers/boards";
import {
  createTask,
  expectKanbanColumns,
  uniqueTaskTitle,
} from "./helpers/tasks";

test.describe("Board details smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("opens board, shows kanban columns, creates and opens task", async ({ page }) => {
    const boardTitle = uniqueBoardTitle();
    const taskTitle = uniqueTaskTitle();
    const created = await createBoardIfAllowed(page, boardTitle);

    if (created) {
      await page.getByRole("link", { name: boardTitle }).click();
    } else {
      await openFirstBoard(page);
    }

    await expect(page).toHaveURL(/\/boards\/[^/]+$/);
    await expectKanbanColumns(page);

    await createTask(page, taskTitle);
    await page.getByText(taskTitle).click();
    await expect(page.getByRole("heading", { name: "Task details" })).toBeVisible();
  });
});
