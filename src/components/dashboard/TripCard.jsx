import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const statusLabels = {
  upcoming: "À venir",
  ongoing: "En cours",
  past: "Terminé",
};

const statusClasses = {
  upcoming: "bg-accent/15 text-accent border-accent/20",
  ongoing: "bg-green-500/15 text-green-700 border-green-500/20",
  past: "bg-muted text-muted-foreground border-border",
};

const coverImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&h=400&fit=crop",
];

export default function TripCard({ trip, index = 0 }) {
  const coverImg = trip.cover_image || coverImages[index % coverImages.length];
  const name = trip.name;
  const locationName = trip.location_name;
  const description = trip.description;
  const memberCount = trip.member_count || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link to={`/trip/${trip.id}/planning`} className="block group">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="relative h-44 overflow-hidden">
            <img
              src={coverImg}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <Badge
              className={`absolute top-3 right-3 ${statusClasses[trip.status]} border text-xs font-medium`}
            >
              {statusLabels[trip.status]}
            </Badge>
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-white font-display font-semibold text-lg leading-tight drop-shadow-md">
                {name}
              </h3>
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>
                {format(new Date(trip.start_date), "d MMM", { locale: fr })} —{" "}
                {format(new Date(trip.end_date), "d MMM yyyy", { locale: fr })}
              </span>
            </div>

            {locationName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{locationName}</span>
              </div>
            )}

            {description && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <p className="line-clamp-2 text-xs leading-relaxed">{description}</p>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground border-t border-border/50">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{memberCount} voyageur{memberCount > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}