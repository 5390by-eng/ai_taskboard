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
  createdAt: z.string(),
});

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
export type AiGenerateFormValues = z.infer<typeof aiGenerateSchema>;
