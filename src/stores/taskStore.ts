import { create } from "zustand";
import { withNormalizedAssignees } from "@/lib/assignee";
import type { Task, TaskStatus, UpdateTaskLocalInput } from "@/types";

type TaskState = {
  tasksByBoard: Record<string, Task[]>;
  locallyModifiedTaskIds: Record<string, Set<string>>;
  setTasks: (boardId: string, tasks: Task[]) => void;
  moveTask: (boardId: string, taskId: string, status: TaskStatus) => void;
  rollbackTask: (boardId: string, taskId: string, previousStatus: TaskStatus) => void;
  addTask: (boardId: string, task: Task) => void;
  updateTask: (boardId: string, task: Task) => void;
  patchTask: (boardId: string, taskId: string, patch: UpdateTaskLocalInput) => void;
  removeTask: (boardId: string, taskId: string) => void;
};

function mergeTasksPreservingLocalEdits(
  incomingTasks: Task[],
  previousTasks: Task[],
  modifiedIds: Set<string>,
): Task[] {
  const previousById = new Map(previousTasks.map((task) => [task.id, task]));

  return incomingTasks.map((serverTask) => {
    const normalized = withNormalizedAssignees(serverTask);

    if (!modifiedIds.has(serverTask.id)) {
      return normalized;
    }

    const previous = previousById.get(serverTask.id);
    if (!previous) {
      return normalized;
    }

    return withNormalizedAssignees({
      ...normalized,
      title: previous.title,
      priority: previous.priority,
      assigneeIds: previous.assigneeIds,
      assigneeId: previous.assigneeId,
    });
  });
}

export const useTaskStore = create<TaskState>((set) => ({
  tasksByBoard: {},
  locallyModifiedTaskIds: {},
  setTasks: (boardId, tasks) =>
    set((state) => {
      const previousTasks = state.tasksByBoard[boardId] ?? [];
      const modifiedIds = state.locallyModifiedTaskIds[boardId] ?? new Set<string>();
      const mergedTasks = mergeTasksPreservingLocalEdits(
        tasks,
        previousTasks,
        modifiedIds,
      );

      return {
        tasksByBoard: { ...state.tasksByBoard, [boardId]: mergedTasks },
      };
    }),
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
        [boardId]: [...(state.tasksByBoard[boardId] ?? []), withNormalizedAssignees(task)],
      },
    })),
  updateTask: (boardId, task) =>
    set((state) => ({
      tasksByBoard: {
        ...state.tasksByBoard,
        [boardId]: (state.tasksByBoard[boardId] ?? []).map((t) =>
          t.id === task.id ? withNormalizedAssignees(task) : t,
        ),
      },
    })),
  patchTask: (boardId, taskId, patch) =>
    set((state) => {
      const tasks = state.tasksByBoard[boardId] ?? [];
      const modifiedIds = new Set(state.locallyModifiedTaskIds[boardId] ?? []);
      modifiedIds.add(taskId);

      return {
        locallyModifiedTaskIds: {
          ...state.locallyModifiedTaskIds,
          [boardId]: modifiedIds,
        },
        tasksByBoard: {
          ...state.tasksByBoard,
          [boardId]: tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            const assigneeIds =
              patch.assigneeIds !== undefined
                ? patch.assigneeIds
                : task.assigneeIds;

            return withNormalizedAssignees({
              ...task,
              ...patch,
              assigneeIds,
            });
          }),
        },
      };
    }),
  removeTask: (boardId, taskId) =>
    set((state) => {
      const modifiedIds = new Set(state.locallyModifiedTaskIds[boardId] ?? []);
      modifiedIds.delete(taskId);

      return {
        locallyModifiedTaskIds: {
          ...state.locallyModifiedTaskIds,
          [boardId]: modifiedIds,
        },
        tasksByBoard: {
          ...state.tasksByBoard,
          [boardId]: (state.tasksByBoard[boardId] ?? []).filter(
            (t) => t.id !== taskId,
          ),
        },
      };
    }),
}));
