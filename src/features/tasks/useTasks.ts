import { withNormalizedAssignees } from "@/lib/assignee";
import { buildTaskNotifyContext } from "@/lib/task-notify-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import { useTaskStore } from "@/stores";
import type { CreateTaskInput, TaskStatus, UpdateTaskInput } from "@/types";
import { toast } from "sonner";

export function useTasks(boardId: string) {
  const setTasks = useTaskStore((s) => s.setTasks);

  return useQuery({
    queryKey: queryKeys.tasks.byBoard(boardId),
    queryFn: async () => {
      const result = await tasksService.listByBoard(boardId);
      if (result.error || !result.data) throw new Error(result.error ?? "Failed to load tasks");
      setTasks(boardId, result.data);
      return useTaskStore.getState().tasksByBoard[boardId] ?? [];
    },
    enabled: !!boardId,
  });
}

export function useCreateTask(boardId: string, boardTitle?: string) {
  const queryClient = useQueryClient();
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  return useMutation({
    mutationFn: async (input: Omit<CreateTaskInput, "boardId" | "notifyContext">) => {
      const notifyContext = buildTaskNotifyContext(
        boardId,
        boardTitle,
        input.assigneeId,
      );
      const result = await tasksService.create({
        ...input,
        boardId,
        notifyContext,
      });
      if (result.error || !result.data) throw new Error(result.error ?? "Failed to create task");
      return result.data;
    },
    onSuccess: (task, input) => {
      const normalizedTask = withNormalizedAssignees({
        ...task,
        assigneeId: task.assigneeId ?? input.assigneeId,
        assigneeIds: input.assigneeId ? [input.assigneeId] : [],
      });
      const existingTasks = useTaskStore.getState().tasksByBoard[boardId] ?? [];
      if (existingTasks.some((existingTask) => existingTask.id === normalizedTask.id)) {
        updateTask(boardId, normalizedTask);
      } else {
        addTask(boardId, normalizedTask);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byBoard(boardId) });
      toast.success("Task created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient();
  const updateTask = useTaskStore((s) => s.updateTask);

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTaskInput }) => {
      const result = await tasksService.update(id, input);
      if (result.error || !result.data) throw new Error(result.error ?? "Failed to update task");
      return result.data;
    },
    onSuccess: (task) => {
      updateTask(boardId, task);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byBoard(boardId) });
      toast.success("Task updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMoveTask(boardId: string) {
  const moveTask = useTaskStore((s) => s.moveTask);
  const rollbackTask = useTaskStore((s) => s.rollbackTask);

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      previousStatus,
    }: {
      taskId: string;
      status: TaskStatus;
      previousStatus: TaskStatus;
    }) => {
      moveTask(boardId, taskId, status);
      const result = await tasksService.updateStatus(taskId, status);
      if (result.error) {
        rollbackTask(boardId, taskId, previousStatus);
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();
  const removeTask = useTaskStore((s) => s.removeTask);

  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await tasksService.delete(taskId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, taskId) => {
      removeTask(boardId, taskId);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byBoard(boardId) });
      toast.success("Task deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
