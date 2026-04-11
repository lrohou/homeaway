import { format, differenceInDays, differenceInHours } from "date-fns";
import { fr } from "date-fns/locale";
import { Plane, Train, BedDouble, Utensils, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const typeIcons = {
  flight: Plane,
  train: Train,
  hotel: BedDouble,
  restaurant: Utensils,
  activity: MapPin,
  transport: Train,
  other: Clock,
};

const typeLabels = {
  flight: "Vol",
  train: "Train",
  hotel: "Hôtel",
  restaurant: "Restaurant",
  activity: "Activité",
  transport: "Transport",
  other: "Événement",
};

export default function NextEventBanner({ step, trip }) {
  if (!step || !trip) return null;

  const Icon = typeIcons[step.type] || Clock;
  const now = new Date();
  const eventDate = new Date(step.date + (step.start_time ? `T${step.start_time}` : "T00:00"));
  const daysUntil = differenceInDays(eventDate, now);
  const hoursUntil = differenceInHours(eventDate, now);

  let timeLabel;
  if (daysUntil < 0) timeLabel = "En cours";
  else if (daysUntil === 0) timeLabel = hoursUntil <= 1 ? "Imminent" : `Dans ${hoursUntil}h`;
  else if (daysUntil === 1) timeLabel = "Demain";
  else timeLabel = `Dans ${daysUntil} jours`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/trip/${trip.id}/planning`}>
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-5 sm:p-6 group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 font-medium mb-0.5">
                  Prochain événement · {typeLabels[step.type]}
                </p>
                <h3 className="font-display font-semibold text-lg truncate">{step.title}</h3>
                <p className="text-sm text-primary-foreground/70 mt-0.5">
                  {format(eventDate, "EEEE d MMMM", { locale: fr })}
                  {step.start_time && ` à ${step.start_time}`}
                  {step.location && ` · ${step.location}`}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                {timeLabel}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}