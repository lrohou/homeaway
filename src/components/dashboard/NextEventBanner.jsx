import { format, differenceInDays, differenceInHours } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Plane, Train, BedDouble, Utensils, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";

const typeIcons = {
  flight: Plane,
  train: Train,
  hotel: BedDouble,
  restaurant: Utensils,
  activity: MapPin,
  transport: Train,
  other: Clock,
};

// Truncate a full address to a short city/place name
function truncateAddress(address, maxLen = 30) {
  if (!address) return "";
  // Try to get the first meaningful segment (city or place name)
  const parts = address.split(",");
  if (parts.length > 1) {
    const short = parts[0].trim();
    if (short.length <= maxLen) return short;
  }
  if (address.length <= maxLen) return address;
  return address.substring(0, maxLen) + "…";
}

export default function NextEventBanner({ step, trip }) {
  const { t, lang } = useTranslation();
  const dateLocale = lang === "fr" ? fr : enUS;

  if (!step || !trip) return null;

  const Icon = typeIcons[step.type] || Clock;
  const now = new Date();
  const eventDate = new Date(step.date + (step.start_time ? `T${step.start_time}` : "T00:00"));
  const daysUntil = differenceInDays(eventDate, now);
  const hoursUntil = differenceInHours(eventDate, now);

  let timeLabel;
  if (daysUntil < 0) timeLabel = t('banner.ongoing');
  else if (daysUntil === 0) timeLabel = hoursUntil <= 1 ? t('banner.imminent') : `${t('banner.inHours').replace('{h}', hoursUntil)}`;
  else if (daysUntil === 1) timeLabel = t('banner.tomorrow');
  else timeLabel = t('banner.inDays').replace('{d}', daysUntil);

  const typeLabel = t(`cat.${step.type}`) || step.type;
  const locationShort = truncateAddress(step.location);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/trip/${trip.id}/planning`}>
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-5 sm:p-6 group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 font-medium mb-0.5">
                  {t('banner.nextEvent')} · {typeLabel}
                </p>
                <h3 className="font-display font-semibold text-lg truncate">{step.title}</h3>
                <p className="text-sm text-primary-foreground/70 mt-0.5 truncate">
                  {format(eventDate, "EEEE d MMMM", { locale: dateLocale })}
                  {step.start_time && ` · ${step.start_time}`}
                  {locationShort && ` · ${locationShort}`}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
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