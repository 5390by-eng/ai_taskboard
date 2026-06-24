import type {
  CreateTaskInput,
  ServiceResult,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from "@/types";
import { mockTasks } from "@/lib/mock-data/tasks";
import { taskSchema } from "@/lib/validators";
import { delay, generateId } from "@/lib/utils";
import { failure, success } from "@/types/api";

let tasks = [...mockTasks];

async function simulateDelay(): Promise<void> {
  await delay(300 + Math.random() * 500);
}

function parseTask(data: unknown): Task | null {
  const result = taskSchema.safeParse(data);
  return result.success ? result.data : null;
}

export const tasksService = {
  async listByBoard(boardId: string): Promise<ServiceResult<Task[]>> {
    await simulateDelay();
    const boardTasks = tasks.filter((t) => t.boardId === boardId);
    return success([...boardTasks]);
  },

  async getTask(id: string): Promise<ServiceResult<Task>> {
    await simulateDelay();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return failure("Task not found");
    }
    const parsed = parseTask(task);
    if (!parsed) {
      return failure("Invalid task data");
    }
    return success(parsed);
  },

  async create(input: CreateTaskInput): Promise<ServiceResult<Task>> {
    await simulateDelay();
    const task: Task = {
      id: generateId("task"),
      boardId: input.boardId,
      title: input.title,
      description: input.description,
      status: input.status ?? "backlog",
      priority: input.priority,
      assigneeId: input.assigneeId,
      createdAt: new Date().toISOString(),
    };
    tasks = [...tasks, task];
    return success(task);
  },

  async update(id: string, input: UpdateTaskInput): Promise<ServiceResult<Task>> {
    await simulateDelay();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return failure("Task not found");
    }
    const updated: Task = { ...tasks[index], ...input };
    tasks = tasks.map((t) => (t.id === id ? updated : t));
    return success(updated);
  },

  async updateStatus(
    id: string,
    status: TaskStatus,
  ): Promise<ServiceResult<Task>> {
    return tasksService.update(id, { status });
  },

  async delete(id: string): Promise<ServiceResult<{ id: string }>> {
    await simulateDelay();
    const exists = tasks.some((t) => t.id === id);
    if (!exists) {
      return failure("Task not found");
    }
    tasks = tasks.filter((t) => t.id !== id);
    return success({ id });
  },

  getTasksSnapshot(): Task[] {
    return [...tasks];
  },
};
