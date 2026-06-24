export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
};

export type TeamMember = Pick<User, "id" | "name" | "email" | "avatarUrl" | "role">;
