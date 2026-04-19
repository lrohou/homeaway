import { useState, useMemo } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import TripCard from "@/components/dashboard/TripCard";
import NextEventBanner from "@/components/dashboard/NextEventBanner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Compass, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";

function computeStatus(trip) {
  const today = new Date().toISOString().split("T")[0];
  if (trip.end_date < today) return "past";
  if (trip.start_date <= today && trip.end_date >= today) return "ongoing";
  return "upcoming";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api.trips.list(),
  });

  // Fetch all details for all trips in parallel
  const tripDetailsQueries = useQueries({
    queries: trips.flatMap(trip => [
      {
        queryKey: ["steps", trip.id],
        queryFn: () => api.tripSteps.list(trip.id),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["accommodations", trip.id],
        queryFn: () => api.accommodations.list(trip.id),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["activities", trip.id],
        queryFn: () => api.activities.list(trip.id),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["transports", trip.id],
        queryFn: () => api.transports.list(trip.id),
        staleTime: 5 * 60 * 1000,
      }
    ]),
  });

  const isLoadingDetails = tripDetailsQueries.some(q => q.isLoading);

  // Aggregate all events from all trips
  const allEvents = useMemo(() => {
    if (tripsLoading || isLoadingDetails) return [];

    const events = [];
    trips.forEach((trip, index) => {
      const baseIdx = index * 4;
      const steps = tripDetailsQueries[baseIdx]?.data || [];
      const accs = tripDetailsQueries[baseIdx + 1]?.data || [];
      const acts = tripDetailsQueries[baseIdx + 2]?.data || [];
      const trans = tripDetailsQueries[baseIdx + 3]?.data || [];

      steps.forEach(s => events.push({ ...s, trip_id: trip.id, type: s.type || 'activity', title: s.title }));
      accs.forEach(a => events.push({ ...a, trip_id: trip.id, type: 'hotel', title: a.name, date: a.checkIn }));
      acts.forEach(a => events.push({ ...a, trip_id: trip.id, type: 'activity', title: a.name, date: a.date }));
      trans.forEach(tr => events.push({
        ...tr,
        trip_id: trip.id,
        type: tr.type || 'transport',
        title: `${tr.departure} → ${tr.arrival}`,
        date: tr.departureTime?.split('T')[0],
        start_time: tr.departureTime?.split('T')[1]?.substring(0, 5)
      }));
    });
    return events;
  }, [trips, tripDetailsQueries, tripsLoading, isLoadingDetails]);

  // Compute statuses
  const tripsWithStatus = useMemo(
    () => trips.map((t) => ({ ...t, status: computeStatus(t) })),
    [trips]
  );

  // Next upcoming event
  const nextEvent = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toTimeString().substring(0, 5);

    const upcoming = allEvents
      .filter((e) => e.date > todayStr || (e.date === todayStr && (e.start_time || "23:59") >= nowTime))
      .sort((a, b) => {
        const dateA = a.date + (a.start_time || "00:00");
        const dateB = b.date + (b.start_time || "00:00");
        return dateA.localeCompare(dateB);
      });
    return upcoming[0] || null;
  }, [allEvents]);

  const nextEventTrip = useMemo(
    () => (nextEvent ? trips.find((t) => t.id === nextEvent.trip_id) : null),
    [nextEvent, trips]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return tripsWithStatus;
    return tripsWithStatus.filter((t) => t.status === filter);
  }, [tripsWithStatus, filter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-1"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome')} {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Next Event Banner */}
      {nextEvent && <NextEventBanner step={nextEvent} trip={nextEventTrip} />}

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-secondary/50 p-1 rounded-full">
          <TabsTrigger value="all" className="rounded-full text-sm px-4">
            {t('dashboard.all')}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-full text-sm px-4 gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            {t('dashboard.upcoming')}
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="rounded-full text-sm px-4 gap-1.5">
            <Plane className="w-3.5 h-3.5" />
            {t('dashboard.ongoing')}
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-full text-sm px-4 gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {t('dashboard.past')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Trip Grid */}
      {tripsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border">
              <Skeleton className="h-44 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Compass className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-1.5">
            {t('dashboard.empty')}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {t('dashboard.welcomeDesc')}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}