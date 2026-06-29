import { createBrowserRouter } from "react-router-dom";
import { AuthLayout, AppLayout, SettingsLayout } from "@/layouts";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RootRedirect } from "@/routes/RootRedirect";
import { ROUTES } from "@/lib/constants";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  BoardsListPage,
  BoardDetailsPage,
  AiTaskGeneratorPage,
  AiAssistantPage,
  TelegramInboxPage,
  BillingPage,
  BillingSuccessPage,
  BillingCancelPage,
  SettingsProfilePage,
  SettingsTeamPage,
  SettingsNotificationsPage,
  SettingsIntegrationsPage,
} from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.boards, element: <BoardsListPage /> },
      { path: "/boards/:id", element: <BoardDetailsPage /> },
      { path: ROUTES.aiGenerator, element: <AiTaskGeneratorPage /> },
      { path: ROUTES.aiChat, element: <AiAssistantPage /> },
      { path: ROUTES.telegram, element: <TelegramInboxPage /> },
      { path: ROUTES.billing, element: <BillingPage /> },
      { path: ROUTES.billingSuccess, element: <BillingSuccessPage /> },
      { path: ROUTES.billingCancel, element: <BillingCancelPage /> },
      {
        path: ROUTES.settings,
        element: <SettingsLayout />,
        children: [
          { index: true, element: <SettingsProfilePage /> },
          { path: "team", element: <SettingsTeamPage /> },
          { path: "notifications", element: <SettingsNotificationsPage /> },
          { path: "integrations", element: <SettingsIntegrationsPage /> },
        ],
      },
    ],
  },
]);
