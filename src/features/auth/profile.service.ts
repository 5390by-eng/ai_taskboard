import type { User as SupabaseUser } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { getProfileSeedFromAuthUser } from "./profile.utils";

const profileRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable().optional(),
  role: z.enum(["owner", "admin", "member"]),
  created_at: z.string(),
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
};

type UpsertProfileInput = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: "owner" | "admin" | "member";
};

function mapProfile(row: z.infer<typeof profileRowSchema>): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url ?? undefined,
    role: row.role,
    createdAt: row.created_at,
  };
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

    const { data, error } = await client
      .from("profiles")
      .upsert(
        {
          id: input.id,
          email: input.email,
          name: input.name,
          avatar_url: input.avatarUrl ?? null,
          role: input.role ?? "member",
        },
        { onConflict: "id" },
      )
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
};
