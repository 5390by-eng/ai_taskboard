export const ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  boards: "/boards",
  boardDetails: (id: string) => `/boards/${id}`,
  aiGenerator: "/ai-generator",
  aiChat: "/ai-chat",
  telegram: "/telegram",
  billing: "/billing",
  billingSuccess: "/billing/success",
  billingCancel: "/billing/cancel",
  settings: "/settings",
} as const;

export const BOARD_COLUMNS = [
  { id: "backlog" as const, title: "Backlog", order: 0 },
  { id: "todo" as const, title: "Todo", order: 1 },
  { id: "in_progress" as const, title: "In Progress", order: 2 },
  { id: "review" as const, title: "Review", order: 3 },
  { id: "done" as const, title: "Done", order: 4 },
];

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

export const STATUS_LABELS = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
} as const;

export const APP_NAME = "AI Task Board";

export const BILLING_POST_CHECKOUT_SYNC_KEY = "billing-post-checkout-sync";
export const BILLING_POST_CHECKOUT_SYNC_WINDOW_MS = 2 * 60 * 1000;

export const TEAM_ROLE_LABELS = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Fullstack Developer",
  qa: "QA Engineer",
  ui_ux: "UI/UX Designer",
  devops: "DevOps Engineer",
  pm: "Project Manager",
} as const;
