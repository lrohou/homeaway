import { Outlet, Link, useLocation } from "react-router-dom";
import { Plus, User, LogOut } from "lucide-react";
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
import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Avatar images from public folder
const AVATAR_IMGS = [
  "/avatar1.png",
  "/avatar2.png",
  "/avatar3.png",
  "/avatar4.png",
  "/avatar5.png",
];

// Pick a deterministic "random" avatar based on user id
function getRandomAvatar(userId) {
  if (!userId) return AVATAR_IMGS[0];
  const idx = (typeof userId === "number" ? userId : String(userId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % AVATAR_IMGS.length;
  return AVATAR_IMGS[Math.abs(idx)];
}

export default function AppLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  // Use user's chosen avatar if available, else deterministic fallback
  const userAvatarImg = useMemo(() => {
    if (user?.avatar) return user.avatar;
    return getRandomAvatar(user?.id);
  }, [user?.avatar, user?.id]);

  const isDashboard = location.pathname === "/";
  const isCommunity = location.pathname.startsWith("/community");

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main row: logo | nav buttons | profile */}
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                <span className="text-primary-foreground font-display font-bold text-lg">H</span>
              </div>
              <span className="font-display font-semibold text-xl text-foreground tracking-tight hidden sm:block">
                Home Away
              </span>
            </Link>

            {/* Center nav: Mes voyages + Communauté */}
            <nav className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
              {/* Mes voyages */}
              <Link to="/" className="group">
                <div
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border-2 transition-all duration-200 select-none",
                    "active:scale-95",
                    isDashboard
                      ? "bg-accent/15 border-accent text-accent shadow-sm"
                      : "bg-transparent border-transparent hover:bg-secondary/60 hover:border-border text-foreground/70 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 shrink-0 transition-all duration-200",
                      isDashboard ? "border-accent shadow-md" : "border-border/60 group-hover:border-accent/50"
                    )}
                  >
                    <img
                      src={userAvatarImg}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                      isDashboard ? "text-accent" : "text-foreground/70 group-hover:text-foreground"
                    )}
                  >
                    {t('dashboard.title')}
                  </span>
                </div>
              </Link>

              {/* Communauté */}
              <Link to="/community" className="group">
                <div
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border-2 transition-all duration-200 select-none",
                    "active:scale-95",
                    isCommunity
                      ? "bg-accent/15 border-accent text-accent shadow-sm"
                      : "bg-transparent border-transparent hover:bg-secondary/60 hover:border-border text-foreground/70 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 shrink-0 transition-all duration-200",
                      isCommunity ? "border-accent shadow-md" : "border-border/60 group-hover:border-accent/50"
                    )}
                  >
                    <img
                      src="/community.png"
                      alt="community"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                      isCommunity ? "text-accent" : "text-foreground/70 group-hover:text-foreground"
                    )}
                  >
                    {t('community.title')}
                  </span>
                </div>
              </Link>
            </nav>

            {/* Right: Profile dropdown */}
            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none group">
                    <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-border hover:border-accent transition-all duration-200 cursor-pointer group-hover:shadow-md group-active:scale-95">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                    {user?.email}
                  </DropdownMenuItem>
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer hover:bg-secondary/60 transition-colors">
                      <User className="w-4 h-4 mr-2" />
                      {t('app.profile')}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={() => logout(true)}
                    className="text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('app.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Second row: New trip button — only on non-trip pages */}
          {!location.pathname.startsWith("/trip/") && (
            <div className="flex items-center justify-center pb-3 sm:pb-4">
              <Link to="/new-trip">
                <Button
                  size="sm"
                  className={cn(
                    "gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5 shadow-md",
                    "transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('app.newTrip')}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}