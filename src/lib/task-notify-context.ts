import type { CreateTaskNotifyContext } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useBoardStore } from "@/stores/boardStore";

export function buildTaskNotifyContext(
  boardId?: string,
  boardTitle?: string,
  targetUserId?: string,
): CreateTaskNotifyContext | undefined {
  const userId = targetUserId ?? useAuthStore.getState().user?.id;
  if (!userId) {
    return undefined;
  }

  const resolvedBoardTitle =
    boardTitle ??
    (boardId
      ? useBoardStore.getState().boards.find((board) => board.id === boardId)?.title
      : undefined);

  return {
    userId,
    boardTitle: resolvedBoardTitle,
  };
}
