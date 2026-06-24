import type {
  AuthSession,
  AuthUser,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ServiceResult,
} from "@/types";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { buildAuthUser, mapSupabaseSession } from "@/features/auth/auth.mapper";
import { mapAuthError } from "@/features/auth/auth.errors";
import { profileService } from "@/features/auth/profile.service";
import { failure, success } from "@/types/api";

function requireSupabaseClient() {
  const client = getSupabaseClient();
  if (!client) {
    return {
      client: null,
      error: failure<{ user: AuthUser; session: AuthSession }>(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      ),
    };
  }

  return { client, error: null };
}

async function buildAuthResult(
  supabaseUser: Parameters<typeof buildAuthUser>[0],
  supabaseSession: Parameters<typeof mapSupabaseSession>[0],
): Promise<ServiceResult<{ user: AuthUser; session: AuthSession }>> {
  try {
    const profile = await profileService.getProfile(supabaseUser.id);
    const user = buildAuthUser(supabaseUser, profile);
    const session = mapSupabaseSession(supabaseSession);
    return success({ user, session });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load user profile";
    return failure(message);
  }
}

export const authService = {
  async login(
    credentials: LoginCredentials,
  ): Promise<ServiceResult<{ user: AuthUser; session: AuthSession }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data, error: authError } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      return failure(mapAuthError(authError));
    }

    if (!data.user || !data.session) {
      return failure("Login failed");
    }

    return buildAuthResult(data.user, data.session);
  },

  async register(
    data: RegisterData,
  ): Promise<ServiceResult<{ user: AuthUser; session: AuthSession }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return error!;
    }

    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    });

    if (signUpError) {
      return failure(mapAuthError(signUpError));
    }

    if (!signUpData.user) {
      return failure("Registration failed");
    }

    await profileService.upsertProfile({
      id: signUpData.user.id,
      email: data.email,
      name: data.name,
    });

    if (signUpData.session) {
      return buildAuthResult(signUpData.user, signUpData.session);
    }

    return this.login({
      email: data.email,
      password: data.password,
    });
  },

  async forgotPassword(
    data: ForgotPasswordData,
  ): Promise<ServiceResult<{ message: string }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return failure(error!.error ?? "Supabase is not configured");
    }

    if (!data.email) {
      return failure("Email is required");
    }

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await client.auth.resetPasswordForEmail(
      data.email,
      { redirectTo },
    );

    if (resetError) {
      return failure(mapAuthError(resetError));
    }

    return success({
      message: "If an account exists, a reset link has been sent.",
    });
  },

  async logout(): Promise<ServiceResult<{ message: string }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return failure(error!.error ?? "Supabase is not configured");
    }

    const { error: signOutError } = await client.auth.signOut();

    if (signOutError) {
      return failure(mapAuthError(signOutError));
    }

    return success({ message: "Logged out successfully" });
  },

  async getSession(): Promise<
    ServiceResult<{ user: AuthUser; session: AuthSession } | null>
  > {
    if (!isSupabaseConfigured) {
      return success(null);
    }

    const client = getSupabaseClient();
    if (!client) {
      return success(null);
    }

    const {
      data: { session },
      error,
    } = await client.auth.getSession();

    if (error) {
      return failure(mapAuthError(error));
    }

    if (!session?.user) {
      return success(null);
    }

    return buildAuthResult(session.user, session);
  },
};
