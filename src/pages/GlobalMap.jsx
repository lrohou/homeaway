import React, { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, ArrowLeft, Navigation, Globe, Maximize2, Minimize2, X } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslation } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  el.className = "trip-map-marker";
  el.innerHTML = `
    <div style="
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${cat.color}, ${cat.color}ED);
      border: 3px solid white;
      box-shadow: 0 4px 12px ${cat.color}40;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
    ">
      ${cat.emoji}
    </div>
  `;
  return el;
}

function createPopupHTML(item, tripName, t) {
  const cat = CATEGORIES[item.type] || CATEGORIES.other;
  return `
    <div style="padding: 12px; min-width: 200px;">
      <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${cat.color}; margin-bottom: 4px;">${tripName}</p>
      <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700;">${item.label}</h4>
      <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${item.location || ''}</p>
      <span style="background: ${cat.color}20; color: ${cat.color}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">
        ${t(cat.key)}
      </span>
    </div>
  `;
}

export default function GlobalMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api.trips.list(),
  });

  const allQueries = useQueries({
    queries: trips.flatMap(trip => [
      { queryKey: ["steps", trip.id], queryFn: () => api.tripSteps.list(trip.id) },
      { queryKey: ["accommodations", trip.id], queryFn: () => api.accommodations.list(trip.id) },
      { queryKey: ["activities", trip.id], queryFn: () => api.activities.list(trip.id) },
      { queryKey: ["transports", trip.id], queryFn: () => api.transports.list(trip.id) }
    ])
  });

  const isLoadingDetails = allQueries.some(q => q.isLoading);

  const allMarkers = useMemo(() => {
    if (tripsLoading || isLoadingDetails) return [];
    const markers = [];
    trips.forEach((trip, idx) => {
      const base = idx * 4;
      const steps = allQueries[base]?.data || [];
      const accs = allQueries[base+1]?.data || [];
      const acts = allQueries[base+2]?.data || [];
      const trans = allQueries[base+3]?.data || [];

      steps.forEach(s => s.latitude && markers.push({ ...s, type: 'step', label: s.title, tripName: trip.name }));
      accs.forEach(a => a.latitude && markers.push({ ...a, type: 'hotel', label: a.name, tripName: trip.name, date: a.checkIn }));
      acts.forEach(a => a.latitude && markers.push({ ...a, type: 'activity', label: a.name, tripName: trip.name, date: a.date }));
      trans.forEach(tr => tr.latitude && markers.push({ ...tr, type: tr.type || 'transport', label: `${tr.departure} → ${tr.arrival}`, tripName: trip.name }));
    });
    return markers;
  }, [trips, allQueries, tripsLoading, isLoadingDetails]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_STYLE,
      center: [2.35, 48.85],
      zoom: 2,
      attributionControl: false
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => setMapLoaded(true));
    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (allMarkers.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    allMarkers.forEach(m => {
      const el = createMarkerElement(m.type);
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(createPopupHTML(m, m.tripName, t));
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.longitude, m.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
      bounds.extend([m.longitude, m.latitude]);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [allMarkers, mapLoaded, t]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col h-screen w-screen overflow-hidden">
      <header className="h-16 border-b flex items-center justify-between px-4 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl">{t('map.worldTitle')}</h1>
            <p className="text-xs text-muted-foreground">{t('map.worldSubtitle')}</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-4 bg-slate-100 text-slate-700 sm:flex hidden">
          <Globe className="w-3.5 h-3.5" />
          {allMarkers.length} {t('map.allPlaces')}
        </Badge>
      </header>
      
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {allMarkers.length === 0 && !tripsLoading && !isLoadingDetails && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-white/50 backdrop-blur-sm pointer-events-none">
            <div className="max-w-xs space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">{t('map.empty')}</p>
            </div>
          </div>
        )}

        {(tripsLoading || isLoadingDetails) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">{t('common.loading')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
