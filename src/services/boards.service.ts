import type { Board, CreateBoardInput, ServiceResult } from "@/types";
import { mockBoards } from "@/lib/mock-data/boards";
import { boardSchema } from "@/lib/validators";
import { delay, generateId } from "@/lib/utils";
import { failure, success } from "@/types/api";

let boards = [...mockBoards];

async function simulateDelay(): Promise<void> {
  await delay(300 + Math.random() * 500);
}

function parseBoard(data: unknown): Board | null {
  const result = boardSchema.safeParse(data);
  return result.success ? result.data : null;
}

export const boardsService = {
  async listBoards(): Promise<ServiceResult<Board[]>> {
    await simulateDelay();
    return success([...boards]);
  },

  async getBoard(id: string): Promise<ServiceResult<Board>> {
    await simulateDelay();
    const board = boards.find((b) => b.id === id);
    if (!board) {
      return failure("Board not found");
    }
    const parsed = parseBoard(board);
    if (!parsed) {
      return failure("Invalid board data");
    }
    return success(parsed);
  },

  async createBoard(input: CreateBoardInput): Promise<ServiceResult<Board>> {
    await simulateDelay();
    const board: Board = {
      id: generateId("board"),
      title: input.title,
      description: input.description,
      ownerId: "user_1",
      memberIds: ["user_1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    boards = [...boards, board];
    return success(board);
  },
};
