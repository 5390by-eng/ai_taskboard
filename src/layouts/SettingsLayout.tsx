import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { label: "Profile", path: "/settings" },
  { label: "Team", path: "/settings/team" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Integrations", path: "/settings/integrations" },
];

export function SettingsLayout() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      <nav className="flex gap-1 border-b">
        {settingsTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === "/settings"}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
