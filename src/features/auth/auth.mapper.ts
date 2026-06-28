import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { userSchema } from "@/lib/validators";
import type { AuthSession, AuthUser } from "@/types";
import type { Profile } from "./profile.service";

export function mapSupabaseSession(session: Session): AuthSession {
  const expiresAt =
    session.expires_at != null
      ? new Date(session.expires_at * 1000).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

  return {
    accessToken: session.access_token,
    expiresAt,
  };
}

export function buildAuthUser(
  supabaseUser: SupabaseUser,
  profile: Profile | null,
): AuthUser {
  const metadata = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const metadataName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    undefined;

  const metadataAvatarUrl =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;

  const metadataTelegramUsername =
    typeof metadata.telegram_username === "string" && metadata.telegram_username.length > 0
      ? metadata.telegram_username.replace(/^@/, "")
      : undefined;

  const email = profile?.email ?? supabaseUser.email ?? "";
  const name =
    profile?.name ??
    metadataName ??
    email.split("@")[0] ??
    "User";

  const user: AuthUser = {
    id: supabaseUser.id,
    email,
    name,
    avatarUrl: profile?.avatarUrl ?? metadataAvatarUrl,
    role: profile?.role ?? "member",
    teamRole: profile?.teamRole,
    telegramUsername: profile?.telegramUsername ?? metadataTelegramUsername,
    createdAt: profile?.createdAt ?? supabaseUser.created_at,
  };

  const parsed = userSchema.safeParse(user);
  if (!parsed.success) {
    throw new Error("Invalid user data received from authentication provider");
  }

  return parsed.data;
}
