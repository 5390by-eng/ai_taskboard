import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { authService } from "@/services";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/stores";

type AuthProviderProps = {
  children: React.ReactNode;
};

async function applyAuthSession(session: Session | null): Promise<boolean> {
  const setSession = useAuthStore.getState().setSession;
  const clearSession = useAuthStore.getState().clearSession;

  const result = await authService.applySession(session);

  if (result.error) {
    clearSession();
    return false;
  }

  if (result.data) {
    setSession(result.data.user, result.data.session);
    return true;
  }

  clearSession();
  return false;
}

function resolveAuthStatus(hasSession: boolean): void {
  useAuthStore
    .getState()
    .setStatus(hasSession ? "authenticated" : "unauthenticated");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("unauthenticated");
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setStatus("unauthenticated");
      return;
    }

    let isMounted = true;

    const bootstrap = async () => {
      setStatus("loading");

      try {
        const result = await authService.getSession();

        if (!isMounted) {
          return;
        }

        if (result.error) {
          useAuthStore.getState().clearSession();
          resolveAuthStatus(false);
          return;
        }

        if (result.data) {
          useAuthStore.getState().setSession(result.data.user, result.data.session);
          resolveAuthStatus(true);
          return;
        }

        useAuthStore.getState().clearSession();
        resolveAuthStatus(false);
      } catch {
        if (isMounted) {
          useAuthStore.getState().clearSession();
          resolveAuthStatus(false);
        }
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      // Avoid calling Supabase auth methods inside this callback directly —
      // it can deadlock bootstrap getSession().
      window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        void (async () => {
          if (event === "SIGNED_OUT" || !session) {
            useAuthStore.getState().clearSession();
            resolveAuthStatus(false);
            return;
          }

          try {
            const hasSession = await applyAuthSession(session);
            if (isMounted) {
              resolveAuthStatus(hasSession);
            }
          } catch {
            if (isMounted) {
              useAuthStore.getState().clearSession();
              resolveAuthStatus(false);
            }
          }
        })();
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setStatus]);

  return <>{children}</>;
}
