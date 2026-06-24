import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user_1",
    email: "alex@example.com",
    name: "Alex Morgan",
    avatarUrl: undefined,
    role: "owner",
    createdAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "user_2",
    email: "sam@example.com",
    name: "Sam Chen",
    avatarUrl: undefined,
    role: "admin",
    createdAt: "2025-02-01T10:00:00.000Z",
  },
  {
    id: "user_3",
    email: "jordan@example.com",
    name: "Jordan Lee",
    avatarUrl: undefined,
    role: "member",
    createdAt: "2025-03-10T10:00:00.000Z",
  },
];

export const currentMockUser = mockUsers[0];
