import type { ChatMessage, ChatSession } from "@/types";

export const mockChatSessions: ChatSession[] = [
  {
    id: "session_1",
    title: "Board setup help",
    createdAt: "2025-06-01T10:00:00.000Z",
    updatedAt: "2025-06-01T11:00:00.000Z",
  },
  {
    id: "session_2",
    title: "Task prioritization",
    createdAt: "2025-06-05T10:00:00.000Z",
    updatedAt: "2025-06-05T10:30:00.000Z",
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg_1",
    sessionId: "session_1",
    role: "user",
    content: "How do I create a new board?",
    createdAt: "2025-06-01T10:00:00.000Z",
  },
  {
    id: "msg_2",
    sessionId: "session_1",
    role: "assistant",
    content:
      "Go to the Boards page and click 'Create Board'. You can add a title, description, and invite team members.",
    createdAt: "2025-06-01T10:00:05.000Z",
  },
  {
    id: "msg_3",
    sessionId: "session_2",
    role: "user",
    content: "What's the best way to prioritize tasks?",
    createdAt: "2025-06-05T10:00:00.000Z",
  },
  {
    id: "msg_4",
    sessionId: "session_2",
    role: "assistant",
    content:
      "Use priority labels (High, Medium, Low) and move urgent items to the Todo column. The AI Generator can also help break down projects into prioritized tasks.",
    createdAt: "2025-06-05T10:00:05.000Z",
  },
];

export const mockAiChatResponses = [
  "I can help you manage your tasks and boards. What would you like to know?",
  "Based on your current board, I'd suggest focusing on high-priority items in the In Progress column first.",
  "You can use drag-and-drop to move tasks between columns. Changes are saved automatically.",
  "To generate tasks from a project description, visit the AI Task Generator page.",
  "Your team has 3 members. You can assign tasks by clicking on a task card and selecting an assignee.",
];
