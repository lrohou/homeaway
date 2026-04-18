import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, FileText, Map, Receipt, Settings, ArrowLeft, Hotel, Plane, Palmtree, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/LanguageContext";

import TripMap from '@/pages/trip/TripMap';

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentTab = location.pathname.split("/").pop();

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const scrollContainerRef = useRef(null);

  // Sync tab scroll with active tab
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    // Find active link element
    const activeTab = scrollContainerRef.current.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  }, [currentTab]);

  const handleSwipe = (direction) => {
    const currentIndex = tabs.findIndex(t => t.path === currentTab);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'right' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      navigate(`/trip/${tripId}/${tabs[nextIndex].path}`);
    }
  };

  return (
    <div>
      <div className="mb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('trip.backToTrips')}
        </Link>
      </div>

      {/* Sticky Tab navigation */}
      <div className="sticky top-0 z-40 -mx-4 px-4 bg-background/95 backdrop-blur-md border-b border-border/50 mb-4 sm:-mx-0 sm:px-0">
        <div className="pt-4 pb-1 px-1">
          {isLoading ? (
            <div className="space-y-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground truncate max-w-sm tracking-tight leading-none mb-0.5">
                {trip?.name || t('common.loading')}
              </h2>
              {trip?.location_name && (
                <p className="text-xs font-medium text-muted-foreground/80 truncate">
                  {trip.location_name}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="relative group/tabs">
          {/* Gradient indicators for horizontal scroll - Enhanced visibility */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/50 to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300 sm:hidden" id="scroll-fade-left" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/50 to-transparent z-10 pointer-events-none transition-opacity duration-300 sm:hidden" id="scroll-fade-right" />

          <div
            ref={scrollContainerRef}
            className="flex flex-nowrap gap-0.5 overflow-x-auto pb-1 mt-2 relative touch-pan-x overscroll-x-contain scrollbar-hide active:cursor-grabbing"
            onScroll={(e) => {
              const left = e.target.scrollLeft > 20;
              const right = e.target.scrollLeft < (e.target.scrollWidth - e.target.clientWidth - 20);
              const fadeLeft = document.getElementById('scroll-fade-left');
              const fadeRight = document.getElementById('scroll-fade-right');
              if (fadeLeft) fadeLeft.style.opacity = left ? '1' : '0';
              if (fadeRight) fadeRight.style.opacity = right ? '1' : '0';
            }}
          >
            {tabs.map((tab) => {
              const isActive = currentTab === tab.path;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={`/trip/${tripId}/${tab.path}`}
                  data-active={isActive}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-bold transition-all whitespace-nowrap -mb-px border-b-2 relative shrink-0",
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground/60 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-4.5 h-4.5", isActive ? "animate-pulse" : "")} />
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
            {/* Spacer at the end to ensure the last tab is visible but also shows there's more space */}
            <div className="w-8 shrink-0 sm:hidden" />
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -100) handleSwipe('left');
              else if (swipe > 100) handleSwipe('right');
            }}
            className="touch-pan-y"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* PERSISTENT MAP - Outside AnimatePresence to prevent unmounting/WebGL loss */}
        <motion.div 
          className={cn(
            "absolute inset-0 z-[30] bg-background pointer-events-none opacity-0 transition-opacity duration-300",
            currentTab === 'map' && "pointer-events-auto opacity-100 relative h-auto"
          )}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = offset.x;
            if (swipe < -100) handleSwipe('left');
            else if (swipe > 100) handleSwipe('right');
          }}
        >
          <TripMap />
        </motion.div>
      </div>
    </div>
  );
}