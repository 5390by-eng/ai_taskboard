import { expect, test } from "@playwright/test";
import { prepareAuthenticatedSession } from "./helpers/session";
import {
  APP_NAV_EXPECTATIONS,
  APP_NAV_ITEMS,
  gotoDashboard,
  navigateViaSidebar,
} from "./helpers/navigation";

test.describe("App navigation smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedSession(page);
  });

  for (const item of APP_NAV_ITEMS) {
    test(`sidebar navigates to ${item}`, async ({ page }) => {
      await gotoDashboard(page);
      await navigateViaSidebar(page, item);

      const expectation = APP_NAV_EXPECTATIONS[item];
      await expect(page).toHaveURL(expectation.url);

      if (expectation.heading) {
        if (typeof expectation.heading === "string") {
          const exact = expectation.heading === "Boards";
          await expect(
            page.getByRole("heading", { name: expectation.heading, exact }),
          ).toBeVisible();
        }
      } else {
        await expect(page.getByRole("button", { name: "New Chat" })).toBeVisible();
      }
    });
  }
});
