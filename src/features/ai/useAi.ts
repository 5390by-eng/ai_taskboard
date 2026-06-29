import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withNormalizedAssignees } from "@/lib/assignee";
import { buildTaskNotifyContext } from "@/lib/task-notify-context";
import { queryKeys } from "@/lib/query-keys";
import { aiService, tasksService, chatService } from "@/services";
import { useTaskStore } from "@/stores";
import type { GeneratedTaskPreview } from "@/types";
import { toast } from "sonner";
import { useRefreshBilling } from "@/features/billing";

export function useAiTaskGenerator(boardId?: string, boardTitle?: string) {
  const [preview, setPreview] = useState<GeneratedTaskPreview[]>([]);

  const generateMutation = useMutation({
    mutationFn: async (projectDescription: string) => {
      const result = await aiService.generateTasksFromDescription({
        projectDescription,
        boardId,
      });
      if (result.error || !result.data) throw new Error(result.error ?? "Generation failed");
      return result.data;
    },
    onSuccess: (data) => {
      setPreview(data);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (tasks: GeneratedTaskPreview[]) => {
      const targetBoardId = boardId ?? "board_1";
      const results = await Promise.all(
        tasks.map((t) => {
          const notifyContext = buildTaskNotifyContext(
            targetBoardId,
            boardTitle,
            t.assigneeId,
          );
          return tasksService.create({
            boardId: targetBoardId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            assigneeId: t.assigneeId,
            status: t.suggestedStatus,
            notifyContext,
          });
        }),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error);
      return results.map((r) => r.data!);
    },
    onSuccess: () => {
      setPreview([]);
      toast.success("Tasks created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePreviewTask = (id: string, updates: Partial<GeneratedTaskPreview>) => {
    setPreview((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  };

  const removePreviewTask = (id: string) => {
    setPreview((prev) => prev.filter((t) => t.id !== id));
  };

  const clearPreview = () => setPreview([]);

  return {
    preview,
    generateMutation,
    confirmMutation,
    updatePreviewTask,
    removePreviewTask,
    clearPreview,
  };
}

export function useBoardTaskPrompt(boardId: string, boardTitle?: string) {
  const queryClient = useQueryClient();
  const refreshBilling = useRefreshBilling();
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [preview, setPreview] = useState<GeneratedTaskPreview[]>([]);
  const [lastPrompt, setLastPrompt] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (message: string) => {
      const result = await aiService.generateTasksForBoard(message, boardId);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to generate tasks");
      }
      return { tasks: result.data, message: message.trim() };
    },
    onSuccess: ({ tasks, message }) => {
      setPreview(tasks);
      setLastPrompt(message);
      void refreshBilling();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (tasks: GeneratedTaskPreview[]) => {
      const results = await Promise.all(
        tasks.map((task) => {
          const notifyContext = buildTaskNotifyContext(boardId, boardTitle, task.assigneeId);
          return tasksService.create({
            boardId,
            title: task.title,
            description: task.description,
            priority: task.priority,
            assigneeId: task.assigneeId,
            status: task.suggestedStatus,
            notifyContext,
          });
        }),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error);
      return results.map((result) => result.data!);
    },
    onSuccess: (createdTasks) => {
      const existingTasks = useTaskStore.getState().tasksByBoard[boardId] ?? [];

      createdTasks.forEach((task) => {
        const normalizedTask = withNormalizedAssignees({
          ...task,
          assigneeIds: task.assigneeId ? [task.assigneeId] : [],
        });

        if (existingTasks.some((existingTask) => existingTask.id === normalizedTask.id)) {
          updateTask(boardId, normalizedTask);
        } else {
          addTask(boardId, normalizedTask);
        }
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byBoard(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.usage() });
      void refreshBilling();
      setPreview([]);
      setLastPrompt("");
      toast.success("Tasks created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePreviewTask = (id: string, updates: Partial<GeneratedTaskPreview>) => {
    setPreview((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    );
  };

  const removePreviewTask = (id: string) => {
    setPreview((prev) => prev.filter((task) => task.id !== id));
  };

  const clearPreview = () => {
    setPreview([]);
    setLastPrompt("");
  };

  const regenerate = () => {
    if (!lastPrompt) return;
    generateMutation.mutate(lastPrompt);
  };

  return {
    preview,
    lastPrompt,
    generateMutation,
    confirmMutation,
    updatePreviewTask,
    removePreviewTask,
    clearPreview,
    regenerate,
  };
}

export function useAiChat() {
  const sendMessage = useMutation({
    mutationFn: async ({
      sessionId,
      content,
    }: {
      sessionId: string;
      content: string;
    }) => chatService.sendMessage(sessionId, content),
  });

  return { sendMessage };
}
