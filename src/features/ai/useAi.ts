import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiService, tasksService, chatService } from "@/services";
import type { GeneratedTaskPreview } from "@/types";
import { toast } from "sonner";

export function useAiTaskGenerator(boardId?: string) {
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
        tasks.map((t) =>
          tasksService.create({
            boardId: targetBoardId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            assigneeId: t.assigneeId,
            status: t.suggestedStatus,
          }),
        ),
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
