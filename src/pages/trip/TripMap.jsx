import React, { useRef, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Loader2, Navigation, BedDouble, Plane, Sparkles, Route as RouteIcon } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslation } from "@/lib/LanguageContext";

const MAPTILER_STYLE = "https://api.maptiler.com/maps/019d9665-0270-7b06-bf41-907c11a5295a/style.json?key=FZ6exJZ6JibveJODuzvj";

// Category config: color, emoji, key
const CATEGORIES = {
  hotel: { color: "#10b981", emoji: "🏠", key: "cat.hotel", gradient: "from-emerald-400 to-teal-500" },
  activity: { color: "#f59e0b", emoji: "🎯", key: "cat.activity", gradient: "from-amber-400 to-orange-500" },
  flight: { color: "#3b82f6", emoji: "✈️", key: "cat.flight", gradient: "from-blue-400 to-indigo-500" },
  train: { color: "#6366f1", emoji: "🚆", key: "cat.train", gradient: "from-indigo-400 to-violet-500" },
  bus: { color: "#8b5cf6", emoji: "🚌", key: "cat.bus", gradient: "from-violet-400 to-purple-500" },
  car: { color: "#ec4899", emoji: "🚗", key: "cat.car", gradient: "from-pink-400 to-rose-500" },
  transport: { color: "#6366f1", emoji: "🚀", key: "cat.transport", gradient: "from-indigo-400 to-violet-500" },
  step: { color: "#a855f7", emoji: "📍", key: "cat.step", gradient: "from-purple-400 to-fuchsia-500" },
  other: { color: "#64748b", emoji: "📌", key: "cat.other", gradient: "from-slate-400 to-gray-500" },
};

function createMarkerElement(type) {
  const cat = CATEGORIES[type] || CATEGORIES.other;
  const el = document.createElement("div");
  el.className = "trip-map-marker group";
  el.innerHTML = `
    <div style="
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: linear-gradient(135deg, ${cat.color}, ${cat.color}ED);
      border: 3px solid white;
      box-shadow: 0 8px 16px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      ${cat.emoji}
    </div>
  `;
  el.addEventListener("mouseenter", () => {
    el.firstElementChild.style.transform = "translateY(-4px) scale(1.05)";
    el.firstElementChild.style.boxShadow = `0 12px 24px ${cat.color}60, inset 0 2px 4px rgba(255,255,255,0.6)`;
  });
  el.addEventListener("mouseleave", () => {
    el.firstElementChild.style.transform = "translateY(0) scale(1)";
    el.firstElementChild.style.boxShadow = `0 8px 16px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.4)`;
  });
  return el;
}

function createPopupHTML(item, t) {
  const cat = CATEGORIES[item.type] || CATEGORIES.other;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

  return `
    <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 240px; max-width: 300px; padding: 4px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, ${cat.color}20, ${cat.color}40); 
          font-size: 20px;
          border: 1px solid ${cat.color}30;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
        ">${cat.emoji}</div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${item.label}
          </h4>
          <span style="
            display: inline-block; padding: 2px 10px;
            font-size: 11px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.5px; border-radius: 20px;
            background: linear-gradient(135deg, ${cat.color}, ${cat.color}ED); color: white;
            box-shadow: 0 2px 4px ${cat.color}30;
          ">${t(cat.key)}</span>
        </div>
      </div>
      ${item.location ? `
        <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style="font-size: 12px; color: #475569; font-weight: 500; line-height: 1.5; word-break: break-word;">${item.location}</span>
        </div>
      ` : ''}
      ${item.date ? `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; font-weight: 600; color: #64748b; padding-left: 4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${item.date}
        </div>
      ` : ''}
      <a
        href="${googleMapsUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 10px 0;
          background: linear-gradient(135deg, ${cat.color}, ${cat.color}ED);
          color: white;
          border: none;
          box-shadow: 0 4px 12px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.3);
          border-radius: 12px;
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px ${cat.color}50, inset 0 2px 4px rgba(255,255,255,0.4)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.3)';"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        ${t('map.goThere')}
      </a>
    </div>
  `;
}

export default function TripMap() {
  const { tripId } = useParams();
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ["steps", tripId],
    queryFn: () => api.tripSteps.list(tripId),
  });

  const { data: accommodations = [], isLoading: accLoading } = useQuery({
    queryKey: ["accommodations", tripId],
    queryFn: () => api.accommodations.list(tripId),
  });

  const { data: activities = [], isLoading: actLoading } = useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => api.activities.list(tripId),
  });

  const { data: transports = [], isLoading: transLoading } = useQuery({
    queryKey: ["transports", tripId],
    queryFn: () => api.transports.list(tripId),
  });

  const allGeoItems = useMemo(() => {
    const items = [];

    steps.forEach((s) => {
      if (s.latitude && s.longitude) {
        items.push({ ...s, type: "step", label: s.title, location: s.location });
      }
    });

    accommodations.forEach((acc) => {
      if (acc.latitude && acc.longitude) {
        items.push({
          ...acc,
          type: "hotel",
          label: acc.name,
          id: `acc-${acc.id}`,
          location: acc.location,
          date: acc.checkIn,
        });
      }
    });

    activities.forEach((act) => {
      if (act.latitude && act.longitude) {
        items.push({
          ...act,
          type: "activity",
          label: act.name,
          id: `act-${act.id}`,
          location: act.location,
          date: act.date,
        });
      }
    });

    transports.forEach((t) => {
      if (t.latitude && t.longitude) {
        items.push({
          ...t,
          type: t.type || "transport",
          label: `${t.departure} → ${t.arrival}`,
          id: `trans-${t.id}`,
          date: t.departureTime?.split("T")[0],
        });
      }
    });

    return items;
  }, [steps, accommodations, activities, transports]);

  // Count items per category for the legend
  const categoryCounts = useMemo(() => {
    const counts = {};
    allGeoItems.forEach((item) => {
      const type = item.type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [allGeoItems]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_STYLE,
      center: [2.3522, 48.8566], // Default Paris
      zoom: 4,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (allGeoItems.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    allGeoItems.forEach((item) => {
      const el = createMarkerElement(item.type);

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "300px",
        className: "trip-map-popup",
      }).setHTML(createPopupHTML(item, t));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
      bounds.extend([item.longitude, item.latitude]);
    });

    // Fit bounds with padding
    mapRef.current.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 14,
      duration: 1000,
    });
  }, [allGeoItems, mapLoaded]);

  const isLoading = stepsLoading || accLoading || actLoading || transLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">{t('map.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {t('map.title')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('map.subtitle')}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="gap-1.5 py-1.5 px-4 bg-slate-100 text-slate-700 border border-slate-200 font-semibold"
        >
          <Navigation className="w-3.5 h-3.5" />
          {allGeoItems.length} {allGeoItems.length > 1 ? t('map.places') : t('map.place')}
        </Badge>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div
          ref={mapContainerRef}
          className="h-[500px] sm:h-[650px] w-full"
          style={{ minHeight: "400px" }}
        />

        {/* Legend overlay */}
        {Object.keys(categoryCounts).length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-fit">
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg">
              {Object.entries(categoryCounts).map(([type, count]) => {
                const cat = CATEGORIES[type] || CATEGORIES.other;
                return (
                  <div
                    key={type}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors hover:bg-slate-50"
                  >
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ background: cat.color }}
                    />
                    <span className="text-xs font-medium text-slate-600">
                      {t(cat.key)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {allGeoItems.length === 0 && (
        <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <MapPin className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            <span className="font-semibold">{t('map.empty')}</span>{" "}
            {t('map.emptyHint')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}