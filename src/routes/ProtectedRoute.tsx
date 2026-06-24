import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import { useAuthStore } from "@/stores";
import { ROUTES } from "@/lib/constants";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = useAuthStore((s) => s.session);
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return <LoadingState message="Checking session..." className="min-h-screen" />;
  }

  if (!session) {
    return (
      <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
}
