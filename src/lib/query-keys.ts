export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  boards: {
    all: ["boards"] as const,
    detail: (id: string) => ["boards", id] as const,
  },
  tasks: {
    byBoard: (boardId: string) => ["tasks", boardId] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
  },
  billing: {
    subscription: ["billing", "subscription"] as const,
    usage: ["billing", "usage"] as const,
    plans: ["billing", "plans"] as const,
  },
  telegram: {
    drafts: ["telegram", "drafts"] as const,
  },
  ai: {
    preview: ["ai", "preview"] as const,
  },
} as const;
