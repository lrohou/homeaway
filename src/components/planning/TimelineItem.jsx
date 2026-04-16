import { Plane, Train, BedDouble, Utensils, MapPin, Car, Clock, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const typeConfig = {
  flight: { icon: Plane, key: "cat.flight", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  train: { icon: Train, key: "cat.train", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  hotel: { icon: BedDouble, key: "cat.hotel", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  restaurant: { icon: Utensils, key: "expenses.food", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  activity: { icon: MapPin, key: "cat.activity", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  transport: { icon: Car, key: "cat.transport", color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  other: { icon: Clock, key: "cat.other", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

import { useTranslation } from "@/lib/LanguageContext";

export default function TimelineItem({ step, onEdit, onDelete, index }) {
  const { t } = useTranslation();
  const config = typeConfig[step.type] || typeConfig.other;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 group"
    >
      {/* Timeline dot & line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow overflow-hidden">
          <div className="flex items-start justify-between gap-3 overflow-hidden">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {step.start_time && (
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {step.start_time}
                    {step.end_time && ` → ${step.end_time}`}
                  </span>
                )}
                <Badge variant="secondary" className={`text-xs border ${config.color}`}>
                  {t(config.key)}
                </Badge>
              </div>
              <h4 className="font-semibold text-foreground">{step.title}</h4>
              {step.location && (
                <div className="flex items-center gap-2 mt-1 sm:mt-0.5 max-w-full">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1" title={step.location}>
                    <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate leading-tight">{step.location}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-all gap-1 ml-auto"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(step.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-3 h-3" />
                      {t('planning.goThere')}
                    </a>
                  </Button>
                </div>
              )}
              {step.notes && (
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{step.notes}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {step.booking_reference && (
                  <span className="text-xs text-muted-foreground">
                    Réf: {step.booking_reference}
                  </span>
                )}
                {step.price && (
                  <span className="text-xs font-medium text-foreground">
                    {step.price}€
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(step)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(step)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}