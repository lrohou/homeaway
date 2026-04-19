import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { useTranslation } from "@/lib/LanguageContext";
import { motion } from "framer-motion";
import { Calendar, User, MapPin, Compass, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const getDuration = (start, end) => {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
};

export default function Community() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data: sharedTrips = [], isLoading } = useQuery({
    queryKey: ["community-trips"],
    queryFn: () => api.community.list(),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return sharedTrips;
    const q = search.toLowerCase();
    return sharedTrips.filter((trip) =>
      trip.trip_name?.toLowerCase().includes(q) ||
      trip.location_name?.toLowerCase().includes(q) ||
      trip.user_name?.toLowerCase().includes(q)
    );
  }, [sharedTrips, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="font-display text-4xl font-bold text-foreground">{t('community.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('community.subtitle')}</p>
      </motion.div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('community.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-full border-border bg-secondary/30 focus:bg-card"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Compass className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            {search ? "Aucun résultat pour cette recherche" : t('community.empty')}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to={`/community/trip/${trip.id}`} className="group block h-full">
                <div className="relative h-full flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-secondary">
                    {trip.cover_image ? (
                      <img
                        src={trip.cover_image}
                        alt={trip.trip_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <MapPin className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-black backdrop-blur-sm border-none shadow-sm">
                        {getDuration(trip.start_date, trip.end_date)} {t('community.days')}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col space-y-3">
                    <h3 className="font-display text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {trip.trip_name}
                    </h3>

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      {trip.location_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          <span className="font-medium text-foreground truncate">{trip.location_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>{t('community.sharedBy')} <span className="font-semibold text-foreground">{trip.user_name}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {trip.comments && (
                      <p className="text-sm text-muted-foreground line-clamp-2 italic pt-2 border-t border-border">
                        "{trip.comments}"
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
