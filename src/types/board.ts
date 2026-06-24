import type { TaskStatus } from "./task";

export type BoardColumn = {
  id: TaskStatus;
  title: string;
  order: number;
};

export type Board = {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateBoardInput = {
  title: string;
  description?: string;
  memberIds: string[];
};
