import { Outlet, Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { LayoutGrid } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link to={ROUTES.login} className="flex items-center gap-2 mb-8">
        <LayoutGrid className="h-8 w-8" />
        <span className="text-2xl font-bold">{APP_NAME}</span>
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
