import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  expectValidationMessages,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import {
  BOARD_VALIDATION_MESSAGES,
  canCreateBoard,
  expectBoardsEmptyState,
  expectBoardsPageLoaded,
  openCreateBoardModal,
  submitCreateBoardForm,
} from "./helpers/boards";
import { gotoBoards } from "./helpers/navigation";

test.describe("Boards validation", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("shows validation error when board title is empty", async ({ page }) => {
    const canCreate = await canCreateBoard(page);
    test.skip(!canCreate, "Board creation unavailable (plan limit reached)");

    await openCreateBoardModal(page);
    await submitCreateBoardForm(page);

    await expectValidationMessages(page, [BOARD_VALIDATION_MESSAGES.titleRequired]);
    await expect(
      page.getByRole("dialog").getByRole("heading", { name: "Create Board" }),
    ).toBeVisible();
  });

  test("shows empty state or existing boards list", async ({ page }) => {
    await gotoBoards(page);
    await expectBoardsPageLoaded(page);

    const emptyHeading = page.getByRole("heading", { name: "No boards yet" });
    const existingBoard = page.locator('a[href^="/boards/"]').first();
    const canCreate = page.getByText("Create Board", { exact: true }).first();

    if (await emptyHeading.isVisible()) {
      await expectBoardsEmptyState(page);
      return;
    }

    await expect(existingBoard).toBeVisible();
    if (await canCreate.isVisible()) {
      await expect(canCreate).toBeVisible();
    }
  });
});
