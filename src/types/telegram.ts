import type { TaskPriority } from "./task";

export type TelegramDraftTask = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  senderName: string;
  senderUsername: string;
  receivedAt: string;
  status: "pending" | "approved" | "rejected";
};
