import React, { useRef, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, MapPin, BedDouble, Plane, Zap, Loader2, Navigation } from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useTranslation } from "@/lib/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPTILER_STYLE = "https://api.maptiler.com/maps/019d9665-0270-7b06-bf41-907c11a5295a/style.json?key=FZ6exJZ6JibveJODuzvj";

const CATEGORIES = {
  hotel: { color: "#10b981", emoji: "🏠", key: "cat.hotel" },
  activity: { color: "#f59e0b", emoji: "🎯", key: "cat.activity" },
  flight: { color: "#3b82f6", emoji: "✈️", key: "cat.flight" },
  train: { color: "#6366f1", emoji: "🚆", key: "cat.train" },
  bus: { color: "#8b5cf6", emoji: "🚌", key: "cat.bus" },
  car: { color: "#ec4899", emoji: "🚗", key: "cat.car" },
  transport: { color: "#6366f1", emoji: "🚀", key: "cat.transport" },
  step: { color: "#a855f7", emoji: "📍", key: "cat.step" },
  other: { color: "#64748b", emoji: "📌", key: "cat.other" },
};

function createMarkerElement(type) {
  const cat = CATEGORIES[type] || CATEGORIES.other;
  const el = document.createElement("div");
  el.innerHTML = `
    <div style="
      width: 44px; height: 44px; border-radius: 16px;
      background: linear-gradient(135deg, ${cat.color}, ${cat.color}ED);
      border: 3px solid white;
      box-shadow: 0 8px 16px ${cat.color}40;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; cursor: pointer;
      transition: all 0.3s ease;
    ">${cat.emoji}</div>
  `;
  return el;
}

const getDuration = (start, end) => {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
};

function CommunityMap({ accommodations, transports, activities, steps }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { t } = useTranslation();

  const allGeoItems = useMemo(() => {
    const items = [];
    steps.forEach((s) => {
      if (s.latitude && s.longitude)
        items.push({ ...s, type: "step", label: s.title });
    });
    accommodations.forEach((acc) => {
      if (acc.latitude && acc.longitude)
        items.push({ ...acc, type: "hotel", label: acc.name, id: `acc-${acc.id}` });
    });
    activities.forEach((act) => {
      if (act.latitude && act.longitude)
        items.push({ ...act, type: "activity", label: act.name, id: `act-${act.id}` });
    });
    transports.forEach((tr) => {
      if (tr.latitude && tr.longitude)
        items.push({ ...tr, type: tr.type || "transport", label: `${tr.departure} → ${tr.arrival}`, id: `trans-${tr.id}` });
    });
    return items;
  }, [steps, accommodations, activities, transports]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_STYLE,
      center: [2.3522, 48.8566],
      zoom: 4,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => setMapLoaded(true));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || allGeoItems.length === 0) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const bounds = new maplibregl.LngLatBounds();
    allGeoItems.forEach((item) => {
      const el = createMarkerElement(item.type);
      const cat = CATEGORIES[item.type] || CATEGORIES.other;
      const popup = new maplibregl.Popup({ offset: 25, closeButton: true, maxWidth: "260px" })
        .setHTML(`<div style="padding:16px;font-family:sans-serif"><div style="font-size:24px;margin-bottom:8px">${cat.emoji}</div><h4 style="margin:0 0 6px;font-size:16px;font-weight:700">${item.label}</h4>${item.location ? `<p style="margin:0;font-size:13px;color:#64748b">${item.location}</p>` : ''}</div>`);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
      bounds.extend([item.longitude, item.latitude]);
    });
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
  }, [allGeoItems, mapLoaded]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl h-[500px]">
      <div ref={mapContainerRef} className="w-full h-full" />
      {allGeoItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 backdrop-blur-sm">
          <div className="text-center text-muted-foreground">
            <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('map.empty')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityTripView() {
  const { sharedTripId } = useParams();
  const { t, lang } = useTranslation();
  const dateLocale = lang === "fr" ? fr : enUS;

  const { data: sharedInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["community-trip", sharedTripId],
    queryFn: () => api.community.get(sharedTripId),
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["community-trip-content", sharedTripId],
    queryFn: () => api.community.getContent(sharedTripId),
    enabled: !!sharedTripId,
  });

  const isLoading = infoLoading || contentLoading;

  const steps = content?.steps || [];
  const accommodations = content?.accommodations || [];
  const transports = content?.transports || [];
  const activities = content?.activities || [];

  // Build planning grouped by day
  const dayGroups = useMemo(() => {
    if (!sharedInfo?.start_date || !sharedInfo?.end_date) return [];
    try {
      const allItems = [...steps];
      accommodations.forEach((acc) => {
        allItems.push({ id: `acc-ci-${acc.id}`, type: "hotel", title: `Check-in: ${acc.name}`, date: acc.checkin, start_time: "10:00", location: acc.location });
        allItems.push({ id: `acc-co-${acc.id}`, type: "hotel", title: `Check-out: ${acc.name}`, date: acc.checkout, start_time: "11:00", location: acc.location });
      });
      activities.forEach((act) => {
        allItems.push({ id: `act-${act.id}`, type: "activity", title: act.name, date: act.date, start_time: act.time, location: act.location });
      });
      transports.forEach((tr) => {
        const depDate = tr.departuretime ? new Date(tr.departuretime) : null;
        if (depDate) {
          allItems.push({ id: `tr-${tr.id}`, type: tr.type || "transport", title: `${tr.departure} → ${tr.arrival}`, date: format(depDate, "yyyy-MM-dd"), start_time: format(depDate, "HH:mm") });
        }
      });

      const days = eachDayOfInterval({ start: parseISO(sharedInfo.start_date), end: parseISO(sharedInfo.end_date) });
      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayItems = allItems.filter((i) => i.date === dateStr).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
        const currentAcc = accommodations.find((acc) => {
          if (!acc.checkin || !acc.checkout) return false;
          return day >= parseISO(acc.checkin) && day < parseISO(acc.checkout);
        });
        return { date: day, dateStr, steps: dayItems, currentAccommodation: currentAcc };
      });
    } catch { return []; }
  }, [sharedInfo, steps, accommodations, activities, transports]);

  const ICON_MAP = { hotel: "🏠", activity: "🎯", flight: "✈️", train: "🚆", bus: "🚌", car: "🚗", transport: "🚀", step: "📍", other: "📌" };
  const COLOR_MAP = { hotel: "bg-emerald-100 text-emerald-700", activity: "bg-amber-100 text-amber-700", flight: "bg-blue-100 text-blue-700", train: "bg-indigo-100 text-indigo-700", bus: "bg-violet-100 text-violet-700", car: "bg-pink-100 text-pink-700", transport: "bg-indigo-100 text-indigo-700", step: "bg-purple-100 text-purple-700", };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!sharedInfo) return (
    <div className="text-center py-20 text-muted-foreground">Voyage introuvable.</div>
  );

  const duration = getDuration(sharedInfo.start_date, sharedInfo.end_date);
  const hasBookings = accommodations.length > 0 || transports.length > 0 || activities.length > 0;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link to="/community" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('community.title')}
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden h-72">
        {sharedInfo.cover_image ? (
          <img src={sharedInfo.cover_image} alt={sharedInfo.trip_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center">
            <MapPin className="w-20 h-20 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">{sharedInfo.trip_name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{t('community.sharedBy')} <strong>{sharedInfo.user_name}</strong></span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(sharedInfo.start_date).toLocaleDateString()} – {new Date(sharedInfo.end_date).toLocaleDateString()}</span>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">{duration} {t('community.days')}</Badge>
          </div>
        </div>
      </motion.div>

      {/* Comments */}
      {sharedInfo.comments && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-secondary/30 border border-border rounded-2xl p-6">
          <p className="text-foreground italic leading-relaxed">"{sharedInfo.comments}"</p>
          <p className="text-sm text-muted-foreground mt-2 font-medium">— {sharedInfo.user_name}</p>
        </motion.div>
      )}

      {/* Tabs: Planning | Bookings | Map */}
      <Tabs defaultValue="planning">
        <TabsList className="bg-secondary/50 p-1 rounded-full">
          <TabsTrigger value="planning" className="rounded-full text-sm px-4">📅 {t('tab.planning')}</TabsTrigger>
          {hasBookings && <TabsTrigger value="bookings" className="rounded-full text-sm px-4">🗂️ {t('community.viewBookings')}</TabsTrigger>}
          <TabsTrigger value="map" className="rounded-full text-sm px-4">🗺️ {t('tab.map')}</TabsTrigger>
        </TabsList>

        {/* Planning Tab */}
        <TabsContent value="planning" className="mt-6">
          {dayGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('planning.noSteps')}</div>
          ) : (
            <div className="space-y-8">
              {dayGroups.map((group, gi) => (
                <motion.div key={group.dateStr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: gi * 0.04 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-display font-semibold text-lg text-foreground capitalize">
                      {format(group.date, "EEEE d MMMM", { locale: dateLocale })}
                    </h3>
                    {group.currentAccommodation && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1">
                        <BedDouble className="w-3.5 h-3.5" />
                        {group.currentAccommodation.name}
                      </Badge>
                    )}
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                      {group.steps.length} {group.steps.length > 1 ? t('planning.steps') : t('planning.step')}
                    </span>
                  </div>
                  {group.steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-4">{t('planning.noSteps')}</p>
                  ) : (
                    <div className="space-y-3">
                      {group.steps.map((step, si) => {
                        const colorClass = COLOR_MAP[step.type] || "bg-secondary text-foreground";
                        const emoji = ICON_MAP[step.type] || "📌";
                        return (
                          <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.03 }} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${colorClass}`}>
                              {emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground">{step.title}</p>
                                {step.start_time && <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{step.start_time}</span>}
                              </div>
                              {step.location && <p className="text-sm text-muted-foreground mt-1 truncate"><MapPin className="w-3.5 h-3.5 inline mr-1" />{step.location}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        {hasBookings && (
          <TabsContent value="bookings" className="mt-6 space-y-8">
            {accommodations.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><BedDouble className="w-5 h-5 text-emerald-500" />{t('tab.accommodations')}</h3>
                <div className="space-y-3">
                  {accommodations.map((acc) => (
                    <div key={acc.id} className="p-5 rounded-xl border border-border bg-card">
                      <p className="font-semibold text-foreground">{acc.name}</p>
                      {acc.location && <p className="text-sm text-muted-foreground mt-1"><MapPin className="w-3.5 h-3.5 inline mr-1" />{acc.location}</p>}
                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        {acc.checkin && <span>Arrivée: <strong>{acc.checkin}</strong></span>}
                        {acc.checkout && <span>Départ: <strong>{acc.checkout}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {transports.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Plane className="w-5 h-5 text-blue-500" />{t('tab.transports')}</h3>
                <div className="space-y-3">
                  {transports.map((tr) => (
                    <div key={tr.id} className="p-5 rounded-xl border border-border bg-card">
                      <p className="font-semibold text-foreground">{tr.departure} → {tr.arrival}</p>
                      {tr.departuretime && <p className="text-sm text-muted-foreground mt-1">Départ: {new Date(tr.departuretime).toLocaleString()}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activities.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" />{t('tab.activities')}</h3>
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={act.id} className="p-5 rounded-xl border border-border bg-card">
                      <p className="font-semibold text-foreground">{act.name}</p>
                      {act.date && <p className="text-sm text-muted-foreground mt-1">{act.date}{act.time && ` à ${act.time}`}</p>}
                      {act.location && <p className="text-sm text-muted-foreground mt-1"><MapPin className="w-3.5 h-3.5 inline mr-1" />{act.location}</p>}
                      {act.description && <p className="text-sm text-muted-foreground mt-2 italic">{act.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Map Tab */}
        <TabsContent value="map" className="mt-6">
          <CommunityMap
            accommodations={accommodations}
            transports={transports}
            activities={activities}
            steps={steps}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
