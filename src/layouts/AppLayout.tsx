import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutGrid,
  Sparkles,
  MessageSquare,
  Send,
  CreditCard,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/features/auth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.boards, label: "Boards", icon: LayoutGrid },
  { to: ROUTES.aiGenerator, label: "AI Generator", icon: Sparkles },
  { to: ROUTES.aiChat, label: "AI Assistant", icon: MessageSquare },
  { to: ROUTES.telegram, label: "Telegram Inbox", icon: Send },
  { to: ROUTES.billing, label: "Billing", icon: CreditCard },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive && "bg-muted text-foreground",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useTheme();
  const logout = useLogout();
  const navigate = useNavigate();

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) ?? "U";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <LayoutGrid className="h-6 w-6" />
          <span className="font-bold">{APP_NAME}</span>
        </div>
        <NavItems />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-14 items-center gap-2 border-b px-4">
                <LayoutGrid className="h-6 w-6" />
                <span className="font-bold">{APP_NAME}</span>
              </div>
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(ROUTES.settings)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
