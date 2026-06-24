import { create } from "zustand";
import type { Task, TaskStatus } from "@/types";

type TaskState = {
  tasksByBoard: Record<string, Task[]>;
  setTasks: (boardId: string, tasks: Task[]) => void;
  moveTask: (boardId: string, taskId: string, status: TaskStatus) => void;
  rollbackTask: (boardId: string, taskId: string, previousStatus: TaskStatus) => void;
  addTask: (boardId: string, task: Task) => void;
  updateTask: (boardId: string, task: Task) => void;
  removeTask: (boardId: string, taskId: string) => void;
};

export const useTaskStore = create<TaskState>((set) => ({
  tasksByBoard: {},
  setTasks: (boardId, tasks) =>
    set((state) => ({
      tasksByBoard: { ...state.tasksByBoard, [boardId]: tasks },
    })),
  moveTask: (boardId, taskId, status) =>
    set((state) => {
      const tasks = state.tasksByBoard[boardId] ?? [];
      return {
        tasksByBoard: {
          ...state.tasksByBoard,
          [boardId]: tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t,
          ),
        },
      };
    }),
  rollbackTask: (boardId, taskId, previousStatus) =>
    set((state) => {
      const tasks = state.tasksByBoard[boardId] ?? [];
      return {
        tasksByBoard: {
          ...state.tasksByBoard,
          [boardId]: tasks.map((t) =>
            t.id === taskId ? { ...t, status: previousStatus } : t,
          ),
        },
      };
    }),
  addTask: (boardId, task) =>
    set((state) => ({
      tasksByBoard: {
        ...state.tasksByBoard,
        [boardId]: [...(state.tasksByBoard[boardId] ?? []), task],
      },
    })),
  updateTask: (boardId, task) =>
    set((state) => ({
      tasksByBoard: {
        ...state.tasksByBoard,
        [boardId]: (state.tasksByBoard[boardId] ?? []).map((t) =>
          t.id === task.id ? task : t,
        ),
      },
    })),
  removeTask: (boardId, taskId) =>
    set((state) => ({
      tasksByBoard: {
        ...state.tasksByBoard,
        [boardId]: (state.tasksByBoard[boardId] ?? []).filter(
          (t) => t.id !== taskId,
        ),
      },
    })),
}));
