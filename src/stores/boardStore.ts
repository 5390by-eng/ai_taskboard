import { create } from "zustand";
import type { Board } from "@/types";

type BoardState = {
  activeBoardId: string | null;
  boards: Board[];
  setActiveBoard: (id: string | null) => void;
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
};

export const useBoardStore = create<BoardState>((set) => ({
  activeBoardId: null,
  boards: [],
  setActiveBoard: (id) => set({ activeBoardId: id }),
  setBoards: (boards) => set({ boards }),
  addBoard: (board) =>
    set((state) => ({ boards: [...state.boards, board] })),
}));
