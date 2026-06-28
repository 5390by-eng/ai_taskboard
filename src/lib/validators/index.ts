import { z } from "zod";
import { TEAM_ROLES } from "@/types/user";

export const taskSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assigneeId: z.string().optional(),
  createdAt: z.string(),
});

export const boardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const teamRoleSchema = z.enum(TEAM_ROLES);

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().optional(),
  role: z.enum(["owner", "admin", "member"]),
  teamRole: teamRoleSchema.optional(),
  telegramUsername: z.string().optional(),
  createdAt: z.string(),
});

export const settingsProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  teamRole: z
    .union([teamRoleSchema, z.literal("")])
    .refine((value) => value !== "", {
      message: "Please select your team role",
    }),
});

export const telegramUsernameSchema = z
  .string()
  .trim()
  .min(1, "Telegram username is required")
  .transform((value) => value.replace(/^@/, ""))
  .refine(
    (value) => /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value),
    {
      message: "Use 5–32 characters: letters, numbers, underscore; must start with a letter",
    },
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    teamRole: z
      .union([teamRoleSchema, z.literal("")])
      .refine((value) => value !== "", {
        message: "Please select your team role",
      }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  assigneeId: z.string().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]).optional(),
});

export const updateTaskLocalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"]),
  assigneeIds: z.array(z.string()),
});

export function createUpdateTaskLocalSchema(memberIds: string[]) {
  return updateTaskLocalSchema.refine(
    (data) => data.assigneeIds.every((assigneeId) => memberIds.includes(assigneeId)),
    {
      message: "Assignee must be a board member",
      path: ["assigneeIds"],
    },
  );
}

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  memberIds: z.array(z.string()),
});

export const aiGenerateSchema = z.object({
  projectDescription: z
    .string()
    .min(10, "Please provide at least 10 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskLocalFormValues = z.infer<typeof updateTaskLocalSchema>;
export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
export type AiGenerateFormValues = z.infer<typeof aiGenerateSchema>;
export type SettingsProfileFormInput = z.input<typeof settingsProfileSchema>;
export type SettingsProfileFormValues = z.output<typeof settingsProfileSchema>;
