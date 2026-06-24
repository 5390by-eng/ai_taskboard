import { z } from "zod";
import type {
  CreateTaskInput,
  ServiceResult,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from "@/types";
import { taskSchema } from "@/lib/validators";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { SUPABASE_CONFIG_MESSAGE } from "@/lib/env";
import { failure, success } from "@/types/api";

const taskRowSchema = z.object({
  id: z.string(),
  board_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee_id: z.string().nullable().optional(),
  position: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

type TaskRow = z.infer<typeof taskRowSchema>;

function requireSupabaseClient() {
  if (!isSupabaseConfigured) {
    return { client: null, error: failure<never>(SUPABASE_CONFIG_MESSAGE) };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { client: null, error: failure<never>(SUPABASE_CONFIG_MESSAGE) };
  }

  return { client, error: null };
}

function mapTaskRow(row: TaskRow): Task {
  const task = {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id ?? undefined,
    createdAt: row.created_at,
  };

  const parsed = taskSchema.safeParse(task);
  if (!parsed.success) {
    throw new Error("Invalid task data received from database");
  }

  return parsed.data;
}

function mapTaskRows(rows: unknown[]): Task[] {
  return rows.flatMap((row) => {
    const parsed = taskRowSchema.safeParse(row);
    if (!parsed.success) {
      return [];
    }

    try {
      return [mapTaskRow(parsed.data)];
    } catch {
      return [];
    }
  });
}

function buildUpdatePayload(input: UpdateTaskInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) {
    payload.title = input.title;
  }
  if (input.description !== undefined) {
    payload.description = input.description;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }
  if (input.priority !== undefined) {
    payload.priority = input.priority;
  }
  if (input.assigneeId !== undefined) {
    payload.assignee_id = input.assigneeId || null;
  }

  return payload;
}

export const tasksService = {
  async listByBoard(boardId: string): Promise<ServiceResult<Task[]>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data, error: queryError } = await client
      .from("tasks")
      .select("*")
      .eq("board_id", boardId)
      .order("status")
      .order("position")
      .order("created_at");

    if (queryError) {
      return failure(queryError.message);
    }

    try {
      return success(mapTaskRows(data ?? []));
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid task data";
      return failure(message);
    }
  },

  async getTask(id: string): Promise<ServiceResult<Task>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data, error: queryError } = await client
      .from("tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (queryError) {
      return failure(queryError.message);
    }

    if (!data) {
      return failure("Task not found");
    }

    const parsed = taskRowSchema.safeParse(data);
    if (!parsed.success) {
      return failure("Invalid task data");
    }

    try {
      return success(mapTaskRow(parsed.data));
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid task data";
      return failure(message);
    }
  },

  async create(input: CreateTaskInput): Promise<ServiceResult<Task>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data, error: insertError } = await client
      .from("tasks")
      .insert({
        board_id: input.boardId,
        title: input.title.trim(),
        description: input.description.trim(),
        status: input.status ?? "backlog",
        priority: input.priority,
        assignee_id: input.assigneeId ?? null,
      })
      .select("*")
      .single();

    if (insertError) {
      return failure(insertError.message);
    }

    const parsed = taskRowSchema.safeParse(data);
    if (!parsed.success) {
      return failure("Invalid task data received from database");
    }

    try {
      return success(mapTaskRow(parsed.data));
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid task data";
      return failure(message);
    }
  },

  async update(id: string, input: UpdateTaskInput): Promise<ServiceResult<Task>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const payload = buildUpdatePayload(input);
    if (Object.keys(payload).length === 0) {
      return tasksService.getTask(id);
    }

    const { data, error: updateError } = await client
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      return failure(updateError.message);
    }

    if (!data) {
      return failure("Task not found");
    }

    const parsed = taskRowSchema.safeParse(data);
    if (!parsed.success) {
      return failure("Invalid task data received from database");
    }

    try {
      return success(mapTaskRow(parsed.data));
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid task data";
      return failure(message);
    }
  },

  async updateStatus(
    id: string,
    status: TaskStatus,
  ): Promise<ServiceResult<Task>> {
    return tasksService.update(id, { status });
  },

  async delete(id: string): Promise<ServiceResult<{ id: string }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data, error: deleteError } = await client
      .from("tasks")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      return failure(deleteError.message);
    }

    if (!data) {
      return failure("Task not found");
    }

    return success({ id: data.id });
  },
};
