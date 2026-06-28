import type { User as SupabaseUser } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { teamRoleSchema } from "@/lib/validators";
import type { TeamRole, UserRole } from "@/types/user";
import { getProfileSeedFromAuthUser } from "./profile.utils";

const profileRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable().optional(),
  role: z.enum(["owner", "admin", "member"]),
  team_role: teamRoleSchema.nullable().optional(),
  telegram_username: z.string().nullable().optional(),
  created_at: z.string(),
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  teamRole?: TeamRole;
  telegramUsername?: string;
  createdAt: string;
};

type UpsertProfileInput = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: UserRole;
  teamRole?: TeamRole;
  telegramUsername?: string | null;
};

export type UpdateProfileFieldsInput = {
  name?: string;
  teamRole?: TeamRole;
  telegramUsername?: string | null;
};

function mapProfile(row: z.infer<typeof profileRowSchema>): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url ?? undefined,
    role: row.role,
    teamRole: row.team_role ?? undefined,
    telegramUsername: row.telegram_username ?? undefined,
    createdAt: row.created_at,
  };
}

function mapProfileUpdateError(error: { code?: string; message?: string }): Error {
  if (error.code === "23505") {
    return new Error("This Telegram username is already taken");
  }

  if (error.code === "23514") {
    return new Error("Invalid Telegram username format");
  }

  return new Error(error.message || "Failed to update profile");
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const parsed = profileRowSchema.safeParse(data);
    if (!parsed.success) {
      return null;
    }

    return mapProfile(parsed.data);
  },

  async upsertProfile(input: UpsertProfileInput): Promise<Profile> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase client is not available");
    }

    const row: Record<string, string | null> = {
      id: input.id,
      email: input.email,
      name: input.name,
      avatar_url: input.avatarUrl ?? null,
      role: input.role ?? "member",
    };

    if (input.teamRole !== undefined) {
      row.team_role = input.teamRole;
    }

    if (input.telegramUsername !== undefined) {
      row.telegram_username = input.telegramUsername;
    }

    const { data, error } = await client
      .from("profiles")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message || "Failed to save user profile");
    }

    if (!data) {
      throw new Error("Failed to save user profile");
    }

    const parsed = profileRowSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid profile data received from database");
    }

    return mapProfile(parsed.data);
  },

  async updateProfileFields(
    userId: string,
    fields: UpdateProfileFieldsInput,
  ): Promise<Profile> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase client is not available");
    }

    const row: Record<string, string | null> = {};

    if (fields.name !== undefined) {
      row.name = fields.name;
    }

    if (fields.teamRole !== undefined) {
      row.team_role = fields.teamRole;
    }

    if (fields.telegramUsername !== undefined) {
      row.telegram_username = fields.telegramUsername;
    }

    if (Object.keys(row).length === 0) {
      throw new Error("No fields to update");
    }

    const { data, error } = await client
      .from("profiles")
      .update(row)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      throw mapProfileUpdateError(error);
    }

    if (!data) {
      throw new Error("Failed to update profile");
    }

    const parsed = profileRowSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid profile data received from database");
    }

    return mapProfile(parsed.data);
  },

  async ensureProfile(supabaseUser: SupabaseUser): Promise<Profile | null> {
    const existing = await this.getProfile(supabaseUser.id);
    if (existing) {
      return existing;
    }

    if (!supabaseUser.email) {
      return null;
    }

    try {
      return await this.upsertProfile(getProfileSeedFromAuthUser(supabaseUser));
    } catch {
      return null;
    }
  },

  async searchProfilesByEmail(query: string, limit = 10): Promise<Profile[]> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return [];
    }

    const { data, error } = await client.rpc("search_profiles_by_email", {
      p_query: trimmedQuery,
      p_limit: limit,
    });

    if (error) {
      throw new Error(error.message || "Failed to search users");
    }

    if (!data) {
      return [];
    }

    return data.flatMap((row: unknown) => {
      const parsed = profileRowSchema.safeParse(row);
      return parsed.success ? [mapProfile(parsed.data)] : [];
    });
  },

  async getBoardMemberProfiles(boardId: string): Promise<Profile[]> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client.rpc("get_board_member_profiles", {
      p_board_id: boardId,
    });

    if (error) {
      throw new Error(error.message || "Failed to load board members");
    }

    if (!data) {
      return [];
    }

    return data.flatMap((row: unknown) => {
      const parsed = profileRowSchema.safeParse(row);
      return parsed.success ? [mapProfile(parsed.data)] : [];
    });
  },

  async getProfilesByIds(userIds: string[]): Promise<Profile[]> {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) {
      return [];
    }

    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .in("id", uniqueIds);

    if (error) {
      throw new Error(error.message || "Failed to load profiles");
    }

    return (data ?? []).flatMap((row: unknown) => {
      const parsed = profileRowSchema.safeParse(row);
      return parsed.success ? [mapProfile(parsed.data)] : [];
    });
  },
};
