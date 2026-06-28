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
  assigneeIds?: string[];
  createdAt: string;
};

export type UpdateTaskLocalInput = Partial<
  Pick<Task, "title" | "priority" | "assigneeIds">
>;

export type CreateTaskNotifyContext = {
  userId: string;
  boardTitle?: string;
};

export type CreateTaskInput = {
  boardId: string;
  title: string;
  description: string;
  status?: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  notifyContext?: CreateTaskNotifyContext;
};

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "priority" | "assigneeId">
>;
