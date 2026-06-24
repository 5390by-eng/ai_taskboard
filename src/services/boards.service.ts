import { z } from "zod";
import type { Board, CreateBoardInput, ServiceResult } from "@/types";
import { boardSchema } from "@/lib/validators";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { SUPABASE_CONFIG_MESSAGE } from "@/lib/env";
import { failure, success } from "@/types/api";

const boardRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  owner_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const createBoardRpcSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  owner_id: z.string(),
  member_ids: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

type BoardRow = z.infer<typeof boardRowSchema>;

function requireSupabaseClient() {
  if (!isSupabaseConfigured) {
    return { client: null, error: failure<never>(SUPABASE_CONFIG_MESSAGE) };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { client: null, error: failure<never>(SUPABASE_CONFIG_MESSAGE) };
  }

  return { client, error: null };
}

function mapBoardRow(row: BoardRow, memberIds: string[]): Board {
  const board = {
    id: row.id,
    title: row.title,
    description: row.description,
    ownerId: row.owner_id,
    memberIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const parsed = boardSchema.safeParse(board);
  if (!parsed.success) {
    throw new Error("Invalid board data received from database");
  }

  return parsed.data;
}

function groupMemberIds(
  memberships: Array<{ board_id: string; user_id: string }>,
): Map<string, string[]> {
  const memberIdsByBoard = new Map<string, string[]>();

  for (const membership of memberships) {
    const current = memberIdsByBoard.get(membership.board_id) ?? [];
    current.push(membership.user_id);
    memberIdsByBoard.set(membership.board_id, current);
  }

  return memberIdsByBoard;
}

export const boardsService = {
  async listBoards(): Promise<ServiceResult<Board[]>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      return failure(userError?.message ?? "Not authenticated");
    }

    const { data: memberships, error: membershipsError } = await client
      .from("board_members")
      .select("board_id")
      .eq("user_id", user.id);

    if (membershipsError) {
      return failure(membershipsError.message);
    }

    const boardIds = [...new Set((memberships ?? []).map((item) => item.board_id))];
    if (boardIds.length === 0) {
      return success([]);
    }

    const { data: boardRows, error: boardsError } = await client
      .from("boards")
      .select("*")
      .in("id", boardIds)
      .order("updated_at", { ascending: false });

    if (boardsError) {
      return failure(boardsError.message);
    }

    const { data: memberRows, error: membersError } = await client
      .from("board_members")
      .select("board_id, user_id")
      .in("board_id", boardIds);

    if (membersError) {
      return failure(membersError.message);
    }

    const memberIdsByBoard = groupMemberIds(memberRows ?? []);

    try {
      const boards = (boardRows ?? []).flatMap((row) => {
        const parsed = boardRowSchema.safeParse(row);
        if (!parsed.success) {
          return [];
        }

        return [mapBoardRow(parsed.data, memberIdsByBoard.get(parsed.data.id) ?? [])];
      });

      return success(boards);
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid board data";
      return failure(message);
    }
  },

  async getBoard(id: string): Promise<ServiceResult<Board>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data: boardRow, error: boardError } = await client
      .from("boards")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (boardError) {
      return failure(boardError.message);
    }

    if (!boardRow) {
      return failure("Board not found");
    }

    const { data: memberRows, error: membersError } = await client
      .from("board_members")
      .select("board_id, user_id")
      .eq("board_id", id);

    if (membersError) {
      return failure(membersError.message);
    }

    const parsed = boardRowSchema.safeParse(boardRow);
    if (!parsed.success) {
      return failure("Invalid board data");
    }

    const memberIds = (memberRows ?? []).map((row) => row.user_id);

    try {
      return success(mapBoardRow(parsed.data, memberIds));
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid board data";
      return failure(message);
    }
  },

  async createBoard(input: CreateBoardInput): Promise<ServiceResult<Board>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data, error: rpcError } = await client.rpc("create_board_with_members", {
      p_title: input.title.trim(),
      p_description: input.description?.trim() ?? "",
      p_member_ids: input.memberIds,
    });

    if (rpcError) {
      return failure(rpcError.message);
    }

    const parsed = createBoardRpcSchema.safeParse(data);
    if (!parsed.success) {
      return failure("Invalid board data received from database");
    }

    try {
      return success(
        mapBoardRow(
          {
            id: parsed.data.id,
            title: parsed.data.title,
            description: parsed.data.description,
            owner_id: parsed.data.owner_id,
            created_at: parsed.data.created_at,
            updated_at: parsed.data.updated_at,
          },
          parsed.data.member_ids,
        ),
      );
    } catch (mappingError) {
      const message =
        mappingError instanceof Error ? mappingError.message : "Invalid board data";
      return failure(message);
    }
  },
};
