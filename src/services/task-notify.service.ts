import { z } from "zod";
import { env } from "@/lib/env";
import type { ServiceResult } from "@/types";
import { failure, success } from "@/types/api";

export type NotifyTaskInput = {
  userId: string;
  task: string;
  boardTitle?: string;
};

export type NotifyTaskResult = {
  notified: true;
  chatId: number;
  username: string;
};

const notifyTaskResponseSchema = z.object({
  notified: z.literal(true),
  chatId: z.number(),
  username: z.string(),
});

const notifyTaskErrorSchema = z.object({
  error: z.string(),
});

function buildNotifyTaskApiUrl(): string {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  return base ? `${base}/api/notify-task` : "/api/notify-task";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const json: unknown = await response.json();
    const parsed = notifyTaskErrorSchema.safeParse(json);
    if (parsed.success) {
      return parsed.data.error;
    }
  } catch {
    // fall through to status-based message
  }

  return `Notification request failed with status ${response.status}`;
}

export const taskNotifyService = {
  async notifyTaskCreated(
    input: NotifyTaskInput,
  ): Promise<ServiceResult<NotifyTaskResult>> {
    const trimmedTask = input.task.trim();
    if (!input.userId || !trimmedTask) {
      return failure("Notification skipped: userId and task are required");
    }

    try {
      const body: Record<string, string> = {
        userId: input.userId,
        task: trimmedTask,
      };

      if (input.boardTitle?.trim()) {
        body.boardTitle = input.boardTitle.trim();
      }

      const response = await fetch(buildNotifyTaskApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(response);
        return failure(errorMessage);
      }

      const json: unknown = await response.json();
      const parsed = notifyTaskResponseSchema.safeParse(json);

      if (!parsed.success) {
        return failure("Invalid response from notification service");
      }

      return success(parsed.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send notification";

      if (errorMessage === "Failed to fetch") {
        return failure(
          "Cannot reach notification service. Check your network or API configuration.",
        );
      }

      return failure(errorMessage);
    }
  },
};
