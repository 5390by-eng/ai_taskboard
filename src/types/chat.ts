export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
