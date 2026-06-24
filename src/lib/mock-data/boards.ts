import type { Board } from "@/types";

export const mockBoards: Board[] = [
  {
    id: "board_1",
    title: "Product Launch",
    description: "Q2 product launch planning and execution",
    ownerId: "user_1",
    memberIds: ["user_1", "user_2", "user_3"],
    createdAt: "2025-04-01T10:00:00.000Z",
    updatedAt: "2025-06-01T10:00:00.000Z",
  },
  {
    id: "board_2",
    title: "Marketing Campaign",
    description: "Summer marketing campaign tasks",
    ownerId: "user_1",
    memberIds: ["user_1", "user_2"],
    createdAt: "2025-05-01T10:00:00.000Z",
    updatedAt: "2025-06-10T10:00:00.000Z",
  },
];
