import type { AuthError } from "@supabase/supabase-js";

export function mapAuthError(error: AuthError | Error): string {
  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Invalid email or password";
  }

  if (message.includes("user already registered")) {
    return "An account with this email already exists";
  }

  if (message.includes("email not confirmed")) {
    return "Please confirm your email before signing in";
  }

  if (message.includes("password")) {
    return error.message;
  }

  return error.message || "Authentication failed";
}
