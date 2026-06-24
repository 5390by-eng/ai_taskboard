import type { TaskPriority, TaskStatus } from "./task";

export type GeneratedTaskPreview = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId?: string;
  suggestedStatus: TaskStatus;
};

export type AiGenerateRequest = {
  projectDescription: string;
  boardId?: string;
};

export type BackendChatRequest = {
  message: string;
  boardId: string;
};

export type BackendGeneratedAssignee = {
  id: string;
  name: string;
  role: string;
  email: string;
  teamRole: string | null;
};

export type BackendGeneratedTask = {
  id: string;
  title: string;
  status: TaskStatus;
  boardId: string;
  assignee: BackendGeneratedAssignee;
  priority: TaskPriority;
};
