import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Plane, Train, BedDouble, Utensils, MapPin, Car, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const typeLabels = {
  flight: "Vol", train: "Train", hotel: "Hôtel",
  restaurant: "Restaurant", activity: "Activité", transport: "Transport", other: "Autre",
};

export default function TripMap() {
  const { tripId } = useParams();

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

    steps.forEach(s => {
      if (s.latitude && s.longitude) {
        items.push({ ...s, type: s.type || 'other', label: s.title });
      }
    });

    accommodations.forEach(acc => {
      if (acc.latitude && acc.longitude) {
        items.push({ ...acc, type: 'hotel', label: acc.name, id: `acc-${acc.id}` });
      }
    });

    activities.forEach(act => {
      if (act.latitude && act.longitude) {
        items.push({ ...act, type: 'activity', label: act.name, id: `act-${act.id}` });
      }
    });

    transports.forEach(t => {
      if (t.latitude && t.longitude) {
        items.push({ ...t, type: t.type || 'transport', label: `${t.departure} → ${t.arrival}`, id: `trans-${t.id}` });
      }
    });

    return items;
  }, [steps, accommodations, activities, transports]);

  const center = useMemo(() => {
    if (allGeoItems.length === 0) return [48.8566, 2.3522]; // Default Paris
    const avgLat = allGeoItems.reduce((s, st) => s + st.latitude, 0) / allGeoItems.length;
    const avgLng = allGeoItems.reduce((s, st) => s + st.longitude, 0) / allGeoItems.length;
    return [avgLat, avgLng];
  }, [allGeoItems]);

  if (stepsLoading || accLoading || actLoading || transLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Carte du voyage</h2>
        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
          <MapPin className="w-3.5 h-3.5" />
          {allGeoItems.length} destinations
        </Badge>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border h-[500px] sm:h-[650px] shadow-lg">
        <MapContainer
          center={center}
          zoom={allGeoItems.length > 0 ? 6 : 5}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {allGeoItems.map((item) => (
            <Marker key={item.id} position={[item.latitude, item.longitude]}>
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <h4 className="font-bold text-sm mb-1">{item.label}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Badge variant="outline" className="capitalize text-[10px] h-4">
                      {typeLabels[item.type] || item.type}
                    </Badge>
                    {item.date && <span>· {item.date}</span>}
                  </div>
                  {item.location && <p className="text-xs italic mb-2">{item.location}</p>}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-1.5 bg-primary text-primary-foreground rounded-md text-[10px] font-medium hover:bg-primary/90 transition-colors"
                  >
                    S'y rendre (Maps)
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {allGeoItems.length === 0 && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Ajoutez des adresses avec coordonnées GPS à vos étapes, logements ou activités pour les voir apparaître sur la carte.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}