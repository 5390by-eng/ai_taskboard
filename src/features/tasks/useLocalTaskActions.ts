import { useMutation } from "@tanstack/react-query";
import { normalizeTaskAssignees } from "@/lib/assignee";
import { buildTaskNotifyContext } from "@/lib/task-notify-context";
import { taskNotifyService } from "@/services";
import { useTaskStore } from "@/stores";
import type { UpdateTaskLocalInput } from "@/types";
import { toast } from "sonner";

async function notifyNewAssignees(
  assigneeIds: string[],
  taskTitle: string,
  boardId: string,
  boardTitle?: string,
): Promise<void> {
  await Promise.all(
    assigneeIds.map(async (assigneeId) => {
      const notifyContext = buildTaskNotifyContext(boardId, boardTitle, assigneeId);
      if (!notifyContext) {
        return;
      }

      const result = await taskNotifyService.notifyTaskCreated({
        userId: notifyContext.userId,
        task: taskTitle.trim(),
        boardTitle: notifyContext.boardTitle,
      });

      if (result.error) {
        console.warn("[task-notify]", result.error);
      }
    }),
  );
}

export function useLocalUpdateTask(boardId: string, boardTitle?: string) {
  const patchTask = useTaskStore((s) => s.patchTask);

  return useMutation({
    mutationFn: async ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskLocalInput;
    }) => {
      const tasks = useTaskStore.getState().tasksByBoard[boardId] ?? [];
      const task = tasks.find((item) => item.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      const previousAssigneeIds = normalizeTaskAssignees(task);
      const nextAssigneeIds =
        input.assigneeIds !== undefined ? input.assigneeIds : previousAssigneeIds;
      const newlyAddedAssigneeIds = nextAssigneeIds.filter(
        (assigneeId) => !previousAssigneeIds.includes(assigneeId),
      );

      patchTask(boardId, taskId, input);

      if (newlyAddedAssigneeIds.length > 0) {
        const taskTitle = input.title ?? task.title;
        await notifyNewAssignees(
          newlyAddedAssigneeIds,
          taskTitle,
          boardId,
          boardTitle,
        );
      }

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
