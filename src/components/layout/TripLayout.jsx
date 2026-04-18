import { Outlet, Link, useLocation, useParams } from "react-router-dom";
import { CalendarDays, FileText, Map, Receipt, Settings, ArrowLeft, Hotel, Plane, Palmtree, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/LanguageContext";

const tabs = [
  { key: "tab.planning", path: "planning", icon: CalendarDays },
  { key: "tab.accommodations", path: "accommodations", icon: Hotel },
  { key: "tab.transports", path: "transports", icon: Plane },
  { key: "tab.activities", path: "activities", icon: Palmtree },
  { key: "tab.documents", path: "documents", icon: FileText },
  { key: "tab.map", path: "map", icon: Map },
  { key: "tab.expenses", path: "expenses", icon: Receipt },
  { key: "tab.chat", path: "chat", icon: MessageSquare },
  { key: "tab.members", path: "members", icon: Users },
  { key: "tab.settings", path: "settings", icon: Settings },
];

export default function TripLayout() {
  const { tripId } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const currentTab = location.pathname.split("/").pop();

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('trip.backToTrips')}
        </Link>
      </div>

      {/* Sticky Tab navigation */}
      <div className="sticky top-0 z-40 -mx-4 px-4 bg-background/80 backdrop-blur-md border-b border-border/50 mb-6 sm:-mx-0 sm:px-0">
        <div className="py-3 px-1">
          {isLoading ? (
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground truncate max-w-sm">
                {trip?.name || t('common.loading')}
              </h2>
              {trip?.location_name && (
                <p className="text-sm text-muted-foreground truncate">
                  {trip.location_name}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          {/* Gradient indicators for horizontal scroll */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 sm:hidden lg:opacity-0" id="scroll-fade-left" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none sm:hidden" id="scroll-fade-right" />
          
          <div 
            className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide relative touch-pan-x"
            onScroll={(e) => {
              const left = e.target.scrollLeft > 10;
              const right = e.target.scrollLeft < (e.target.scrollWidth - e.target.clientWidth - 10);
              document.getElementById('scroll-fade-left').style.opacity = left ? '1' : '0';
              document.getElementById('scroll-fade-right').style.opacity = right ? '1' : '0';
            }}
          >
            {tabs.map((tab) => {
              const isActive = currentTab === tab.path;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={`/trip/${tripId}/${tab.path}`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap -mb-px border-b-2 relative shrink-0",
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
                  {t(tab.key)}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}