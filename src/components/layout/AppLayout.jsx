import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/LanguageContext";

export default function AppLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">H</span>
            </div>
            <span className="font-display font-semibold text-xl text-foreground tracking-tight">
              Home Away
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/new-trip">
              <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-4">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('app.newTrip')}</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="w-11 h-11 border-2 border-border hover:border-accent transition-colors cursor-pointer">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                  {user?.email}
                </DropdownMenuItem>
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    {t('app.profile')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => logout(true)} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('app.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}