import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services";
import { useAuthStore } from "@/stores";
import { ROUTES } from "@/lib/constants";
import type { LoginCredentials, RegisterData } from "@/types";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await authService.login(credentials);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Login failed");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.session);
      setStatus("authenticated");
      toast.success("Welcome back!");
      navigate(ROUTES.dashboard);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await authService.register(data);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Registration failed");
      }
      return result.data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.session);
      setStatus("authenticated");
      toast.success("Account created successfully!");
      navigate(ROUTES.dashboard);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const result = await authService.forgotPassword(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("If an account exists, a reset link has been sent.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const result = await authService.logout();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      clearSession();
      setStatus("unauthenticated");
      navigate(ROUTES.login);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
