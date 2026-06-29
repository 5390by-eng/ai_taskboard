import { expect, test } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  getTestCredentials,
  loginAsTestUser,
} from "./helpers/auth";
import {
  createBoardIfAllowed,
  expectBoardsPageLoaded,
  openBoardByTitle,
  openFirstBoard,
  uniqueBoardTitle,
} from "./helpers/boards";
import { gotoBoards } from "./helpers/navigation";

test.describe("Boards smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
    const credentials = getTestCredentials();
    test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
    await loginAsTestUser(page, credentials!);
  });

  test("loads boards page", async ({ page }) => {
    await gotoBoards(page);
    await expectBoardsPageLoaded(page);
  });

  test("creates a board and opens board details", async ({ page }) => {
    const boardTitle = uniqueBoardTitle();
    const created = await createBoardIfAllowed(page, boardTitle);

    if (created) {
      await openBoardByTitle(page, boardTitle);
      await expect(page.getByRole("heading", { name: boardTitle })).toBeVisible();
      return;
    }

    const existingBoardTitle = await openFirstBoard(page);
    await expect(
      page.getByRole("heading", { name: existingBoardTitle, exact: true }),
    ).toBeVisible();
  });
});
