import { useMutation } from "@tanstack/react-query";
import { useTaskStore } from "@/stores";
import type { UpdateTaskLocalInput } from "@/types";
import { toast } from "sonner";

export function useLocalUpdateTask(boardId: string) {
  const patchTask = useTaskStore((s) => s.patchTask);

  return useMutation({
    mutationFn: async ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskLocalInput;
    }) => {
      patchTask(boardId, taskId, input);
      return { taskId, input };
    },
    onSuccess: () => {
      toast.success("Task updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLocalDeleteTask(boardId: string) {
  const removeTask = useTaskStore((s) => s.removeTask);

  return useMutation({
    mutationFn: async (taskId: string) => {
      removeTask(boardId, taskId);
      return { taskId };
    },
    onSuccess: () => {
      toast.success("Task deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
