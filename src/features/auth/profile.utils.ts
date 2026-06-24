import type { User as SupabaseUser } from "@supabase/supabase-js";

type ProfileSeedInput = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getProfileSeedFromAuthUser(
  supabaseUser: SupabaseUser,
): ProfileSeedInput {
  const metadata = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const email = supabaseUser.email ?? "";
  const name =
    readMetadataString(metadata, "full_name") ??
    readMetadataString(metadata, "name") ??
    email.split("@")[0] ??
    "User";

  return {
    id: supabaseUser.id,
    email,
    name,
    avatarUrl: readMetadataString(metadata, "avatar_url"),
  };
}
