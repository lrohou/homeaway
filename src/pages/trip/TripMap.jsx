import React, { useRef, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Loader2, Navigation, BedDouble, Plane, Maximize2, Minimize2, X, Route as RouteIcon } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslation } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div style="
      font-family: 'DM Sans', sans-serif; 
      min-width: 260px; 
      max-width: 320px; 
      padding: 20px;
      color: #1e293b;
    ">
      <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px;">
        <div style="
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, ${cat.color}20, ${cat.color}40); 
          font-size: 24px;
          border: 1px solid ${cat.color}30;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
          flex-shrink: 0;
        ">${cat.emoji}</div>
        <div style="flex: 1; min-width: 0; padding-top: 2px;">
          <h4 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${item.label}
          </h4>
          <span style="
            display: inline-flex; align-items: center; padding: 4px 12px;
            font-size: 10px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.8px; border-radius: 20px;
            background: linear-gradient(135deg, ${cat.color}, ${cat.color}DA); 
            color: white;
            box-shadow: 0 4px 12px ${cat.color}40;
          ">${t(cat.key)}</span>
        </div>
      </div>

      ${item.location ? `
        <div style="
          display: flex; align-items: flex-start; gap: 10px; 
          margin-bottom: 16px; padding: 12px; 
          background: rgba(0,0,0,0.03); border-radius: 14px; 
          border: 1px solid rgba(0,0,0,0.05);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${cat.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style="font-size: 13px; color: #475569; font-weight: 600; line-height: 1.4; word-break: break-word;">${item.location}</span>
        </div>
      ` : ''}

      ${item.date ? `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px; font-size: 14px; font-weight: 700; color: #64748b; padding-left: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 14px 0;
          background: linear-gradient(135deg, ${cat.color}, ${cat.color}DA);
          color: white;
          border: none;
          box-shadow: 0 8px 20px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.3);
          border-radius: 14px;
          font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        "
        onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 24px ${cat.color}50';"
        onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 20px ${cat.color}40';"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // Handle map resize on fullscreen toggle
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.resize();
      }, 100);
    }
  }, [isFullScreen]);

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
  }, [allGeoItems, mapLoaded, t]);

  return (
    <div className="space-y-5">
      <style>{`
        .maplibregl-popup-content {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-radius: 20px !important;
          padding: 0 !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        .maplibregl-popup-close-button {
          color: #64748b !important;
          font-size: 20px !important;
          padding: 8px !important;
          border-radius: 50% !important;
          right: 4px !important;
          top: 4px !important;
          transition: background 0.2s !important;
          z-index: 10 !important;
        }
        .maplibregl-popup-close-button:hover {
          background: rgba(0,0,0,0.05) !important;
        }
        .maplibregl-popup-tip {
          border-top-color: rgba(255, 255, 255, 0.7) !important;
        }
        .fullscreen-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 9999 !important;
          background: white !important;
          margin: 0 !important;
          border-radius: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .fullscreen-overlay .map-container {
          flex: 1 !important;
          height: 100% !important;
        }
      `}</style>
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
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1.5 py-1.5 px-4 bg-slate-100 text-slate-700 border border-slate-200 font-semibold hidden sm:flex"
          >
            <Navigation className="w-3.5 h-3.5" />
            {allGeoItems.length} {allGeoItems.length > 1 ? t('map.places') : t('map.place')}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="rounded-full border-slate-200 shadow-sm"
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4 text-blue-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Map Container - Uses Portal for fullscreen to escape parent transforms */}
      {isFullScreen ? createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">
          <div className="bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              {t('map.title')}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="rounded-full h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full flex-1 map-container"
          />
          {renderLegend()}
        </div>,
        document.body
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/50 h-[500px] sm:h-[650px]">
          <div
            ref={mapContainerRef}
            className="w-full h-full map-container"
          />
          {renderLegend()}
        </div>
      )}

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

  function renderLegend() {
    if (Object.keys(categoryCounts).length === 0) return null;
    return (
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-fit z-[10]">
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
    );
  }
}