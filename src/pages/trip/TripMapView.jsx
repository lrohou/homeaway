import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Hotel, Plane, Palmtree } from 'lucide-react';

export default function TriPMap() {
  const { tripId } = useParams();

  const { data: accommodations = [] } = useQuery({
    queryKey: ['accommodations', tripId],
    // TODO: Remplacer par api.accommodations.list(tripId)
  });

  const { data: transports = [] } = useQuery({
    queryKey: ['transports', tripId],
    // TODO: Remplacer par api.transports.list(tripId)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', tripId],
    // TODO: Remplacer par api.activities.list(tripId)
  });

  // Simple map visualization (without Leaflet for now)
  const allItems = [
    ...accommodations.map(a => ({ ...a, type: 'accommodation', icon: Hotel })),
    ...transports.map(t => ({ ...t, type: 'transport', icon: Plane })),
    ...activities.map(a => ({ ...a, type: 'activity', icon: Palmtree }))
  ];

  // Mock coordinates for demo
  const getCoordinates = (item) => {
    if (item.type === 'accommodation') {
      return { lat: item.latitude || 48.8566, lng: item.longitude || 2.3522 };
    } else if (item.type === 'transport') {
      return { lat: item.latitude || 48.8566, lng: item.longitude || 2.3522 };
    } else if (item.type === 'activity') {
      return { lat: item.latitude || 48.8606, lng: item.longitude || 2.3352 };
    }
    return { lat: 48.8566, lng: 2.3522 };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trip Map</h1>
        <p className="text-gray-600 mt-1">View all your trip locations on a map</p>
      </div>

      {/* Map Preview */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trip Overview
          </CardTitle>
          <CardDescription>
            Interactive map showing accommodations, transports, and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Simple map representation */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-lg border border-blue-100 min-h-96 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Interactive Map Coming Soon</h3>
              <p className="text-gray-600 text-sm">
                Integrating Leaflet maps for full location visualization
              </p>
            </div>

            {/* Map Stats */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="bg-white p-4 rounded-lg text-center border border-gray-100">
                <Hotel className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="font-semibold">{accommodations.length}</p>
                <p className="text-xs text-gray-600">Accommodations</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border border-gray-100">
                <Plane className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">{transports.length}</p>
                <p className="text-xs text-gray-600">Transports</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border border-gray-100">
                <Palmtree className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="font-semibold">{activities.length}</p>
                <p className="text-xs text-gray-600">Activities</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>All Trip Items ({allItems.length})</CardTitle>
          <CardDescription>All locations added to your trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allItems.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No items added yet</p>
            ) : (
              allItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {item.name || `${item.type} ${idx + 1}`}
                      </h4>
                      <Badge variant="outline" className="capitalize text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      📍 {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Map Integration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p className="mb-2">
            To enable full map functionality:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Install Leaflet: <code className="bg-white px-1 rounded">npm install leaflet react-leaflet</code></li>
            <li>Add coordinates (latitude, longitude) to each item</li>
            <li>Render markers for each location</li>
            <li>Enable interactive features (zoom, pan, etc.)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
