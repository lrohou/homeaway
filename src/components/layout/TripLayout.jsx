import { Outlet, Link, useLocation, useParams } from "react-router-dom";
import { CalendarDays, FileText, Map, Receipt, Settings, ArrowLeft, Hotel, Plane, Palmtree, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  { label: "Planning", path: "planning", icon: CalendarDays },
  { label: "Logements", path: "accommodations", icon: Hotel },
  { label: "Transports", path: "transports", icon: Plane },
  { label: "Activités", path: "activities", icon: Palmtree },
  { label: "Documents", path: "documents", icon: FileText },
  { label: "Carte", path: "map", icon: Map },
  { label: "Dépenses", path: "expenses", icon: Receipt },
  { label: "Chat", path: "chat", icon: MessageSquare },
  { label: "Membres", path: "members", icon: Users },
  { label: "Paramètres", path: "settings", icon: Settings },
];

export default function TripLayout() {
  const { tripId } = useParams();
  const location = useLocation();
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
          Mes voyages
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
              <h2 className="font-display text-xl font-bold text-foreground truncate">
                {trip?.name || "Chargement..."}
              </h2>
              {trip?.location_name && (
                <p className="text-sm text-muted-foreground truncate">
                  {trip.location_name}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={`/trip/${tripId}/${tab.path}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap -mb-px border-b-2 relative",
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
                {tab.label}
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

      <Outlet />
    </div>
  );
}