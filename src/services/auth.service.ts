import type {
  AuthSession,
  AuthUser,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  RegisterResult,
  ResetPasswordData,
  ServiceResult,
} from "@/types";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { SUPABASE_CONFIG_MESSAGE } from "@/lib/env";
import { buildAuthUser, mapSupabaseSession } from "@/features/auth/auth.mapper";
import { mapAuthError } from "@/features/auth/auth.errors";
import { profileService } from "@/features/auth/profile.service";
import { ROUTES } from "@/lib/constants";
import { failure, success } from "@/types/api";

function requireSupabaseClient() {
  const client = getSupabaseClient();
  if (!client) {
    return {
      client: null,
      error: failure<{ user: AuthUser; session: AuthSession }>(
        SUPABASE_CONFIG_MESSAGE,
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
  ): Promise<ServiceResult<RegisterResult>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return failure(error!.error ?? SUPABASE_CONFIG_MESSAGE);
    }

    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${window.location.origin}${ROUTES.login}`,
      },
    });

    if (signUpError) {
      return failure(mapAuthError(signUpError));
    }

    if (!signUpData.user) {
      return failure("Registration failed");
    }

    try {
      await profileService.upsertProfile({
        id: signUpData.user.id,
        email: data.email,
        name: data.name,
      });
    } catch (profileError) {
      const message =
        profileError instanceof Error
          ? profileError.message
          : "Failed to create user profile";
      return failure(message);
    }

    if (signUpData.session) {
      const authResult = await buildAuthResult(
        signUpData.user,
        signUpData.session,
      );
      if (authResult.error || !authResult.data) {
        return failure(authResult.error ?? "Registration failed");
      }

      return success({
        type: "session",
        user: authResult.data.user,
        session: authResult.data.session,
      });
    }

    return success({
      type: "email_confirmation",
      email: data.email,
    });
  },

  async forgotPassword(
    data: ForgotPasswordData,
  ): Promise<ServiceResult<{ message: string }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return failure(error!.error ?? SUPABASE_CONFIG_MESSAGE);
    }

    if (!data.email) {
      return failure("Email is required");
    }

    const redirectTo = `${window.location.origin}${ROUTES.resetPassword}`;
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

  async updatePassword(
    data: ResetPasswordData,
  ): Promise<ServiceResult<{ message: string }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return failure(error!.error ?? SUPABASE_CONFIG_MESSAGE);
    }

    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession();

    if (sessionError) {
      return failure(mapAuthError(sessionError));
    }

    if (!session) {
      return failure("Password reset link is invalid or has expired");
    }

    const { error: updateError } = await client.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      return failure(mapAuthError(updateError));
    }

    await client.auth.signOut();

    return success({ message: "Password updated successfully" });
  },

  async logout(): Promise<ServiceResult<{ message: string }>> {
    const { client, error } = requireSupabaseClient();
    if (!client || error) {
      return failure(error!.error ?? SUPABASE_CONFIG_MESSAGE);
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
