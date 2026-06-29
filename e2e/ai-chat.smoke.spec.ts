import { expect, test } from "@playwright/test";
import { prepareAuthenticatedSession } from "./helpers/session";
import { expectAiChatLoaded } from "./helpers/ai";
import { gotoAiChat } from "./helpers/navigation";

test.describe("AI chat smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedSession(page);
  });

  test("loads chat layout with sidebar and prompt input", async ({ page }) => {
    await gotoAiChat(page);
    await expectAiChatLoaded(page);
  });

  test("shows empty conversation hint for a new session", async ({ page }) => {
    await gotoAiChat(page);
    await page.getByRole("button", { name: "New Chat" }).click();

    await expect(
      page.getByText("Start a conversation with the AI assistant"),
    ).toBeVisible();
  });

  test("disables send button until prompt has text", async ({ page }) => {
    await gotoAiChat(page);
    const prompt = page.getByPlaceholder("Ask anything about your tasks and boards...");
    const sendButton = prompt.locator("xpath=ancestor::div[contains(@class,'flex')][1]/button");

    await expect(sendButton).toBeDisabled();
    await prompt.fill("What tasks are on my board?");
    await expect(sendButton).toBeEnabled();
  });

  test("creates a new chat session from sidebar", async ({ page }) => {
    await gotoAiChat(page);
    await page.getByRole("button", { name: "New Chat" }).click();

    await expect(
      page.getByText("Start a conversation with the AI assistant"),
    ).toBeVisible();
  });
});
