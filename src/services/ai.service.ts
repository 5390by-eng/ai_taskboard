import { z } from "zod";
import type {
  BackendGeneratedTask,
  GeneratedTaskPreview,
  ServiceResult,
} from "@/types";
import { generateMockTasksFromDescription } from "@/lib/mock-data/ai-responses";
import { env } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase";
import { generateId } from "@/lib/utils";
import { delay } from "@/lib/utils";
import { success, failure } from "@/types/api";

const backendAssigneeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  email: z.string(),
  teamRole: z.string().nullable(),
});

const backendGeneratedTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
  boardId: z.string(),
  assignee: backendAssigneeSchema,
  priority: z.enum(["low", "medium", "high"]),
});

const backendChatResponseSchema = z.array(backendGeneratedTaskSchema);

async function simulateDelay(): Promise<void> {
  await delay(800 + Math.random() * 700);
}

function mapBackendTaskToPreview(task: BackendGeneratedTask): GeneratedTaskPreview {
  return {
    id: generateId("preview"),
    title: task.title,
    description: "",
    priority: task.priority,
    assigneeId: task.assignee.id,
    suggestedStatus: task.status,
  };
}

function buildChatApiUrl(): string {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  return base ? `${base}/api/chat` : "/api/chat";
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be signed in to use AI features");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export const aiService = {
  async generateTasksFromDescription(
    request: { projectDescription: string; boardId?: string },
  ): Promise<ServiceResult<GeneratedTaskPreview[]>> {
    await simulateDelay();
    const tasks = generateMockTasksFromDescription(request.projectDescription);
    return success(tasks);
  },

  async generateTasksForBoard(
    message: string,
    boardId: string,
  ): Promise<ServiceResult<GeneratedTaskPreview[]>> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return failure("Message cannot be empty");
    }

    if (!boardId) {
      return failure("Board ID is required");
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(buildChatApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({ message: trimmedMessage, boardId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const json: unknown = JSON.parse(errorText);
          if (
            typeof json === "object" &&
            json !== null &&
            "error" in json &&
            typeof json.error === "string"
          ) {
            return failure(json.error);
          }
        } catch {
          // fall through
        }
        return failure(errorText || `Request failed with status ${response.status}`);
      }

      const json: unknown = await response.json();
      const parsed = backendChatResponseSchema.safeParse(json);

      if (!parsed.success) {
        return failure("Invalid response from task generation service");
      }

      return success(parsed.data.map(mapBackendTaskToPreview));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate tasks";
      if (errorMessage === "Failed to fetch") {
        return failure(
          "Cannot reach task generation service. Check your network or API configuration.",
        );
      }
      return failure(errorMessage);
    }
  },
};
