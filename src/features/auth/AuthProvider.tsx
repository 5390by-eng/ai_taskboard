import { useEffect } from "react";
import { authService } from "@/services";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/stores";

type AuthProviderProps = {
  children: React.ReactNode;
};

async function syncAuthState(): Promise<void> {
  const setSession = useAuthStore.getState().setSession;
  const clearSession = useAuthStore.getState().clearSession;

  const result = await authService.getSession();

  if (result.error) {
    clearSession();
    return;
  }

  if (result.data) {
    setSession(result.data.user, result.data.session);
    return;
  }

  clearSession();
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
      await syncAuthState();
      if (isMounted) {
        const { session } = useAuthStore.getState();
        setStatus(session ? "authenticated" : "unauthenticated");
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        useAuthStore.getState().clearSession();
        setStatus("unauthenticated");
        return;
      }

      await syncAuthState();
      setStatus("authenticated");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setStatus]);

  return <>{children}</>;
}
