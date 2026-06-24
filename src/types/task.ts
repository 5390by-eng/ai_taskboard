export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "done";

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdAt: string;
};

export type CreateTaskInput = {
  boardId: string;
  title: string;
  description: string;
  status?: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
};

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "priority" | "assigneeId">
>;
