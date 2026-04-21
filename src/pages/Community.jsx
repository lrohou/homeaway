import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { useTranslation } from "@/lib/LanguageContext";
import { motion } from "framer-motion";
import { Calendar, User, MapPin, Compass, Search, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const getDuration = (start, end) => {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
};

export default function Community() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState("all");
  const [location, setLocation] = useState(null);
  const [showLiked, setShowLiked] = useState(false);

  const { data: sharedTrips = [], isLoading } = useQuery({
    queryKey: ["community-trips"],
    queryFn: () => api.community.list(),
  });

  const filtered = useMemo(() => {
    let result = sharedTrips;

    // Filter by text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((trip) =>
        trip.trip_name?.toLowerCase().includes(q) ||
        trip.user_name?.toLowerCase().includes(q)
      );
    }

    // Filter by destination location exact
    if (location && location.address) {
      // Just check if the string matches loosely or if the destination matches
      // The AddressAutocomplete sometimes returns city, we can just do a string includes on location_name
      const locQ = location.address.split(',')[0].toLowerCase();
      result = result.filter(trip => trip.location_name?.toLowerCase().includes(locQ));
    }

    // Filter by duration
    if (duration !== "all") {
      result = result.filter(trip => {
        const d = getDuration(trip.start_date, trip.end_date);
        if (duration === "1-3") return d <= 3;
        if (duration === "4-7") return d >= 4 && d <= 7;
        if (duration === "8-14") return d >= 8 && d <= 14;
        if (duration === "15+") return d >= 15;
        return true;
      });
    }

    // Filter by liked
    if (showLiked) {
      result = result.filter(trip => trip.is_liked_by_user);
    }

    return result;
  }, [sharedTrips, search, duration, location, showLiked]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="font-display text-4xl font-bold text-foreground">{t('community.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('community.subtitle')}</p>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-full mb-2 self-start flex-wrap">
          <button
            onClick={() => setShowLiked(false)}
            className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${!showLiked ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('community.filter.all')}
          </button>
          <button
            onClick={() => setShowLiked(true)}
            className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${showLiked ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Heart className={`w-4 h-4 ${showLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            {t('community.likes')}
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              placeholder={t('community.searchPlaceholder') || "Rechercher un voyage, un créateur..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border bg-background"
            />
          </div>
          <div className="flex-1">
            <AddressAutocomplete
              placeholder={t('community.filter.destination')}
              onSelect={loc => setLocation(loc)}
              defaultValue=""
            />
          </div>
          <div className="w-full md:w-48 shrink-0">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-11 rounded-xl border-border bg-background">
                <SelectValue placeholder={t('community.filter.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('community.filter.all')}</SelectItem>
                <SelectItem value="1-3">{t('community.filter.duration.1-3')}</SelectItem>
                <SelectItem value="4-7">{t('community.filter.duration.4-7')}</SelectItem>
                <SelectItem value="8-14">{t('community.filter.duration.8-14')}</SelectItem>
                <SelectItem value="15+">{t('community.filter.duration.15+')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
            {search ? t('community.empty') : t('community.empty')}
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
                    {trip.like_count > 0 && (
                      <div className="absolute top-4 right-4 group-hover:-translate-y-0.5 transition-transform">
                        <Badge className="bg-rose-500/90 text-white border-none shadow-sm flex items-center gap-1.5 px-2.5 py-1 backdrop-blur-md">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span className="font-semibold">{trip.like_count}</span>
                        </Badge>
                      </div>
                    )}
                    {trip.is_liked_by_user && trip.like_count === 0 && (
                      <div className="absolute top-4 right-4 group-hover:-translate-y-0.5 transition-transform">
                        <Badge className="bg-rose-500/90 text-white border-none shadow-sm flex items-center gap-1.5 px-2.5 py-1 backdrop-blur-md">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </Badge>
                      </div>
                    )}
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
