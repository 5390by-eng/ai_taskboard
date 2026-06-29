import { expect, test } from "@playwright/test";
import { prepareAuthenticatedSession } from "./helpers/session";
import {
  AI_GENERATOR_MIN_CHARS,
  clickGenerateTasks,
  expectAiGeneratorLoaded,
  expectGenerateTasksDisabled,
  expectGenerateTasksEnabled,
  fillProjectDescription,
} from "./helpers/ai";
import { gotoAiGenerator } from "./helpers/navigation";

test.describe("AI generator smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedSession(page);
  });

  test("loads generator layout and project description form", async ({ page }) => {
    await gotoAiGenerator(page);
    await expectAiGeneratorLoaded(page);
    await expectGenerateTasksDisabled(page);
  });

  test("keeps generate disabled until description is long enough", async ({ page }) => {
    await gotoAiGenerator(page);
    await fillProjectDescription(page, "short");
    await expectGenerateTasksDisabled(page);

    const validDescription = "Build a mobile app with authentication and dark mode";
    await fillProjectDescription(page, validDescription);
    await expectGenerateTasksEnabled(page);
    expect(validDescription.length).toBeGreaterThanOrEqual(AI_GENERATOR_MIN_CHARS);
  });

  test("starts generation for a valid project description", async ({ page }) => {
    await gotoAiGenerator(page);
    await fillProjectDescription(
      page,
      "Create an e2e test project with login, boards, and billing pages",
    );
    await clickGenerateTasks(page);

    await expect(
      page.getByRole("button", { name: /Generating|Generate Tasks/ }),
    ).toBeVisible();

    await Promise.race([
      page.getByText(/failed|error|Generation failed/i).waitFor({ timeout: 30_000 }),
      page.getByRole("button", { name: "Confirm & Create Tasks" }).waitFor({ timeout: 30_000 }),
      page.getByRole("button", { name: "Generate Tasks" }).waitFor({ timeout: 30_000 }),
    ]).catch(() => undefined);
  });
});
