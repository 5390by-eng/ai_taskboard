export const TEAM_ROLES = [
  "frontend",
  "backend",
  "fullstack",
  "qa",
  "ui_ux",
  "devops",
  "pm",
] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export type UserRole = "owner" | "admin" | "member";

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  teamRole?: TeamRole;
  telegramUsername?: string;
  createdAt: string;
};

export type TeamMember = Pick<User, "id" | "name" | "email" | "avatarUrl" | "role">;
