import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsService } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import { useBoardStore } from "@/stores";
import { BOARD_COLUMNS } from "@/lib/constants";
import type { CreateBoardInput } from "@/types";

export function useBoards() {
  const setBoards = useBoardStore((s) => s.setBoards);

  return useQuery({
    queryKey: queryKeys.boards.all,
    queryFn: async () => {
      const result = await boardsService.listBoards();
      if (result.error || !result.data) throw new Error(result.error ?? "Failed to load boards");
      setBoards(result.data);
      return result.data;
    },
  });
}

export function useBoard(id: string) {
  const setActiveBoard = useBoardStore((s) => s.setActiveBoard);

  return useQuery({
    queryKey: queryKeys.boards.detail(id),
    queryFn: async () => {
      const result = await boardsService.getBoard(id);
      if (result.error) throw new Error(result.error);
      setActiveBoard(id);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useBoardColumns() {
  return BOARD_COLUMNS;
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const addBoard = useBoardStore((s) => s.addBoard);

  return useMutation({
    mutationFn: async (input: CreateBoardInput) => {
      const result = await boardsService.createBoard(input);
      if (result.error || !result.data) throw new Error(result.error ?? "Failed to create board");
      return result.data;
    },
    onSuccess: (board) => {
      addBoard(board);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    },
  });
}
