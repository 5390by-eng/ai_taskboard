import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, AuthUser } from "@/types";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  session: AuthSession | null;
  status: AuthStatus;
  setSession: (user: AuthUser, session: AuthSession) => void;
  clearSession: () => void;
  setStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      status: "idle",
      setSession: (user, session) =>
        set({ user, session, status: "authenticated" }),
      clearSession: () =>
        set({ user: null, session: null, status: "unauthenticated" }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    },
  ),
);
