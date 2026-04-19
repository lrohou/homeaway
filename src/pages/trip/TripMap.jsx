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

import { MAPTILER_STYLE, CATEGORIES, createMarkerElement, createPopupHTML, MAP_POPUP_CSS } from "@/lib/mapHelpers";

export default function TripMap() {
  const { tripId } = useParams();
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // High-stability: Keep the same physical DOM element to avoid WebGL context loss
  const persistentMapContainer = useMemo(() => {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.className = 'persistent-map-canvas';
    return div;
  }, []);

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
      container: persistentMapContainer,
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

  // Handle map container migration and resize on fullscreen toggle
  useEffect(() => {
    if (mapContainerRef.current) {
      // Move our persistent map div into the currently active container (portal or inline)
      mapContainerRef.current.appendChild(persistentMapContainer);
      
      if (mapRef.current) {
        // Multi-stage resize to handle animation frames on mobile
        mapRef.current.resize();
        const timer = setTimeout(() => mapRef.current?.resize(), 100);
        return () => clearTimeout(timer);
      }
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
      <style>{MAP_POPUP_CSS}</style>
      <style>{`
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
            className="rounded-full border-slate-200 shadow-lg h-11 w-11 bg-white"
          >
            {isFullScreen ? (
              <Minimize2 className="w-5 h-5 text-blue-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-slate-600" />
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
            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="rounded-full h-11 w-11 bg-slate-100/50">
              <X className="w-5 h-5 text-slate-600" />
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