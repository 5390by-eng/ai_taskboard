import type { TaskPriority } from "./task";

export type GeneratedTaskPreview = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId?: string;
  suggestedStatus: "backlog" | "todo";
};

export type AiGenerateRequest = {
  projectDescription: string;
  boardId?: string;
};
