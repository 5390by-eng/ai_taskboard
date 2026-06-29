import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  expectValidationMessages,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import {
  createBoardIfAllowed,
  openFirstBoard,
  submitCreateBoardForm,
  uniqueBoardTitle,
} from "./helpers/boards";
import {
  expectBoardNotFound,
  openCreateTaskModal,
  submitCreateTaskForm,
  TASK_VALIDATION_MESSAGES,
} from "./helpers/tasks";

test.describe("Board details validation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("shows board not found for invalid board id", async ({ page }) => {
    await page.goto("/boards/00000000-0000-0000-0000-000000000000");
    await expectBoardNotFound(page);
  });

  test("shows validation error when task title is empty", async ({ page }) => {
    const boardTitle = uniqueBoardTitle();
    const created = await createBoardIfAllowed(page, boardTitle);

    if (created) {
      await page.getByRole("link", { name: boardTitle }).click();
    } else {
      await openFirstBoard(page);
    }

    await openCreateTaskModal(page);
    await submitCreateTaskForm(page);

    await expectValidationMessages(page, [TASK_VALIDATION_MESSAGES.titleRequired]);
    await expect(
      page.getByRole("dialog").getByRole("heading", { name: "Create Task" }),
    ).toBeVisible();
  });
});
