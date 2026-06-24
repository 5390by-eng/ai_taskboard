import { Navigate } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import { useAuthStore } from "@/stores";
import { ROUTES } from "@/lib/constants";

export function RootRedirect() {
  const session = useAuthStore((s) => s.session);
  const status = useAuthStore((s) => s.status);

  if (status === "idle" || status === "loading") {
    return <LoadingState message="Loading..." className="min-h-screen" />;
  }

  return <Navigate to={session ? ROUTES.dashboard : ROUTES.login} replace />;
}
