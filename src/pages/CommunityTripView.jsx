import React, { useRef, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, MapPin, BedDouble, Plane, Zap, Navigation, Maximize2, Minimize2, X, Heart } from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { useTranslation } from "@/lib/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAPTILER_STYLE, CATEGORIES, createMarkerElement, createPopupHTML, MAP_POPUP_CSS } from "@/lib/mapHelpers";

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { t } = useTranslation();

  const persistentMapContainer = useMemo(() => {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    return div;
  }, []);

  const allGeoItems = useMemo(() => {
    const items = [];
    steps.forEach((s) => {
      if (s.latitude && s.longitude)
        items.push({ ...s, type: "step", label: s.title });
    });
    accommodations.forEach((acc) => {
      if (acc.latitude && acc.longitude)
        items.push({ ...acc, type: "hotel", label: acc.name, id: `acc-${acc.id}`, location: acc.location, date: acc.checkin });
    });
    activities.forEach((act) => {
      if (act.latitude && act.longitude)
        items.push({ ...act, type: "activity", label: act.name, id: `act-${act.id}`, location: act.location, date: act.date });
    });
    transports.forEach((tr) => {
      if (tr.latitude && tr.longitude)
        items.push({ ...tr, type: tr.type || "transport", label: `${tr.departure} → ${tr.arrival}`, id: `trans-${tr.id}`, date: tr.departuretime?.split("T")[0] });
    });
    return items;
  }, [steps, accommodations, activities, transports]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: persistentMapContainer,
      style: MAPTILER_STYLE,
      center: [2.3522, 48.8566],
      zoom: 4,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("load", () => setMapLoaded(true));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; setMapLoaded(false); };
  }, []);

  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.appendChild(persistentMapContainer);
      if (mapRef.current) {
        mapRef.current.resize();
        const t = setTimeout(() => mapRef.current?.resize(), 100);
        return () => clearTimeout(t);
      }
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || allGeoItems.length === 0) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const bounds = new maplibregl.LngLatBounds();
    allGeoItems.forEach((item) => {
      const el = createMarkerElement(item.type);
      const popup = new maplibregl.Popup({ offset: 25, closeButton: true, closeOnClick: false, maxWidth: "300px", className: "trip-map-popup" })
        .setHTML(createPopupHTML(item, t));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
      bounds.extend([item.longitude, item.latitude]);
    });
    mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
  }, [allGeoItems, mapLoaded, t]);

  const mapContent = (
    <div ref={mapContainerRef} className="w-full h-full map-container" />
  );

  const fullscreenPortal = createPortal(
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">
      <div className="bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center shrink-0">
        <h3 className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" />{t('map.title')}</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="rounded-full h-11 w-11 bg-slate-100/50">
          <X className="w-5 h-5 text-slate-600" />
        </Button>
      </div>
      <div ref={mapContainerRef} className="w-full flex-1 map-container" />
    </div>,
    document.body
  );

  return (
    <>
      <style>{MAP_POPUP_CSS}</style>
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl h-[500px] sm:h-[600px]">
        {!isFullScreen && mapContent}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-4 right-4 z-10 rounded-full border-slate-200 shadow-lg h-11 w-11 bg-white"
        >
          <Maximize2 className="w-5 h-5 text-slate-600" />
        </Button>
        {allGeoItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 backdrop-blur-sm">
            <div className="text-center text-muted-foreground">
              <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('map.empty')}</p>
            </div>
          </div>
        )}
      </div>
      {isFullScreen && fullscreenPortal}
    </>
  );
}

export default function CommunityTripView() {
  const { sharedTripId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: sharedInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["community-trip", sharedTripId],
    queryFn: () => api.community.get(sharedTripId),
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["community-trip-content", sharedTripId],
    queryFn: () => api.community.getContent(sharedTripId),
    enabled: !!sharedTripId,
  });

  const likeMutation = useMutation({
    mutationFn: () => api.community.like(sharedTripId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["community-trip", sharedTripId] });
      const previous = queryClient.getQueryData(["community-trip", sharedTripId]);
      queryClient.setQueryData(["community-trip", sharedTripId], old => ({
        ...old,
        is_liked_by_user: true,
        like_count: Number(old.like_count || 0) + 1
      }));
      return { previous };
    },
    onError: (err, newTodo, context) => queryClient.setQueryData(["community-trip", sharedTripId], context.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["community-trip", sharedTripId] }),
  });

  const unlikeMutation = useMutation({
    mutationFn: () => api.community.unlike(sharedTripId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["community-trip", sharedTripId] });
      const previous = queryClient.getQueryData(["community-trip", sharedTripId]);
      queryClient.setQueryData(["community-trip", sharedTripId], old => ({
        ...old,
        is_liked_by_user: false,
        like_count: Math.max(0, Number(old.like_count || 0) - 1)
      }));
      return { previous };
    },
    onError: (err, newTodo, context) => queryClient.setQueryData(["community-trip", sharedTripId], context.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["community-trip", sharedTripId] }),
  });

  const handleLikeToggle = () => {
    if (sharedInfo?.is_liked_by_user) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const isLoading = infoLoading || contentLoading;
  const steps = content?.steps || [];
  const accommodations = content?.accommodations || [];
  const transports = content?.transports || [];
  const activities = content?.activities || [];

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
      return days.map((day, index) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayItems = allItems.filter((i) => i.date === dateStr).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
        const currentAcc = accommodations.find((acc) => {
          if (!acc.checkin || !acc.checkout) return false;
          return day >= parseISO(acc.checkin) && day < parseISO(acc.checkout);
        });
        return { date: day, dateStr, dayNumber: index + 1, steps: dayItems, currentAccommodation: currentAcc };
      });
    } catch { return []; }
  }, [sharedInfo, steps, accommodations, activities, transports]);

  const ICON_MAP = { hotel: "🏠", activity: "🎯", flight: "✈️", train: "🚆", bus: "🚌", car: "🚗", transport: "🚀", step: "📍", other: "📌" };
  const COLOR_MAP = { hotel: "bg-emerald-100 text-emerald-700", activity: "bg-amber-100 text-amber-700", flight: "bg-blue-100 text-blue-700", train: "bg-indigo-100 text-indigo-700", bus: "bg-violet-100 text-violet-700", car: "bg-pink-100 text-pink-700", transport: "bg-indigo-100 text-indigo-700", step: "bg-purple-100 text-purple-700" };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      </div>
    );
  }

  if (!sharedInfo) return <div className="text-center py-20 text-muted-foreground">Voyage introuvable.</div>;

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
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            onClick={handleLikeToggle}
            className={`w-12 h-12 rounded-full shadow-lg backdrop-blur-md transition-all ${
              sharedInfo.is_liked_by_user 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-white/20 hover:bg-white/40 text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${sharedInfo.is_liked_by_user ? 'fill-current' : ''}`} />
          </Button>
          <div className="bg-white/90 backdrop-blur-sm text-rose-600 px-3 py-1 rounded-full text-center text-sm font-bold shadow-md">
            {sharedInfo.like_count || 0}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">{sharedInfo.trip_name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            {sharedInfo.location_name && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{sharedInfo.location_name}</span>
            )}
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

      {/* Tabs */}
      <Tabs defaultValue="planning">
        <TabsList className="bg-secondary/50 p-1 rounded-full">
          <TabsTrigger value="planning" className="rounded-full text-sm px-4">📅 {t('tab.planning')}</TabsTrigger>
          {hasBookings && <TabsTrigger value="bookings" className="rounded-full text-sm px-4">🗂️ {t('community.viewBookings')}</TabsTrigger>}
          <TabsTrigger value="map" className="rounded-full text-sm px-4">🗺️ {t('tab.map')}</TabsTrigger>
        </TabsList>

        {/* Planning Tab — Jour X instead of full date */}
        <TabsContent value="planning" className="mt-6">
          {dayGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('planning.noSteps')}</div>
          ) : (
            <div className="space-y-8">
              {dayGroups.map((group, gi) => (
                <motion.div key={group.dateStr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: gi * 0.04 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-display font-semibold text-lg text-foreground">
                      Jour {group.dayNumber}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {format(group.date, "d MMM")}
                      </span>
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
                          <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.03 }}
                            className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${colorClass}`}>{emoji}</div>
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
                        {acc.checkin && <span>Arrivée : <strong>{acc.checkin}</strong></span>}
                        {acc.checkout && <span>Départ : <strong>{acc.checkout}</strong></span>}
                      </div>
                      {acc.review && <p className="text-sm text-muted-foreground italic mt-3 pt-3 border-t border-border">"{acc.review}"</p>}
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
                      {tr.departuretime && <p className="text-sm text-muted-foreground mt-1">Départ : {new Date(tr.departuretime).toLocaleString()}</p>}
                      {tr.review && <p className="text-sm text-muted-foreground italic mt-3 pt-3 border-t border-border">"{tr.review}"</p>}
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
                      {act.description && <p className="text-sm text-muted-foreground mt-2">{act.description}</p>}
                      {act.review && <p className="text-sm text-muted-foreground italic mt-3 pt-3 border-t border-border">"{act.review}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Map Tab */}
        <TabsContent value="map" className="mt-6">
          <CommunityMap accommodations={accommodations} transports={transports} activities={activities} steps={steps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
