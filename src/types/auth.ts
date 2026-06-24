import type { User } from "./user";

export type AuthSession = {
  accessToken: string;
  expiresAt: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  password: string;
  confirmPassword: string;
};

export type RegisterResult =
  | { type: "session"; user: AuthUser; session: AuthSession }
  | { type: "email_confirmation"; email: string };

export type AuthUser = User;
