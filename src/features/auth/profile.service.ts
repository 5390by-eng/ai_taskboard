import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

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

  async upsertProfile(input: UpsertProfileInput): Promise<Profile | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const { data, error } = await client
      .from("profiles")
      .upsert(
        {
          id: input.id,
          email: input.email,
          name: input.name,
          role: input.role ?? "member",
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error || !data) {
      return null;
    }

    const parsed = profileRowSchema.safeParse(data);
    if (!parsed.success) {
      return null;
    }

    return mapProfile(parsed.data);
  },
};
