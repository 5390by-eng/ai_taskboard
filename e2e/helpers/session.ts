import { test, type Page } from "@playwright/test";
import {
  E2E_LOGIN_SKIP_MESSAGE,
  clearAuthStorage,
  getTestCredentials,
  loginAsTestUser,
} from "./auth";

export async function prepareAuthenticatedSession(page: Page): Promise<void> {
  await clearAuthStorage(page);
  const credentials = getTestCredentials();
  test.skip(!credentials, E2E_LOGIN_SKIP_MESSAGE);
  await loginAsTestUser(page, credentials!);
}
