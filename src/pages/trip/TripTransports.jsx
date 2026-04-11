import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Plane, Train, Bus, Trash2, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function TripTransports() {
  const { tripId } = useParams();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'flight',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    bookingReference: '',
    price: '',
    currency: 'EUR',
    latitude: '',
    longitude: ''
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: transports = [] } = useQuery({
    queryKey: ['transports', tripId],
    queryFn: () => api.transports.list(tripId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.transports.create(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
      setIsOpen(false);
      setFormData({
        type: 'flight',
        departure: '',
        arrival: '',
        departureTime: '',
        arrivalTime: '',
        bookingReference: '',
        price: '',
        currency: 'EUR',
        latitude: '',
        longitude: ''
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.transports.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transports', tripId] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    });
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'train':
        return <Train className="w-5 h-5" />;
      case 'bus':
        return <Bus className="w-5 h-5" />;
      default:
        return <Plane className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transports</h1>
          <p className="text-gray-600 mt-1">Manage your trip transportation</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Transport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transport</DialogTitle>
              <DialogDescription>Add a flight, train, or bus booking</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transport Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="car">Car Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure">Departure</Label>
                  <Input
                    id="departure"
                    value={formData.departure}
                    onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                    placeholder="CDG, NYC, etc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival">Arrival</Label>
                  <Input
                    id="arrival"
                    value={formData.arrival}
                    onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                    placeholder="LYS, LAX, etc"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deptTime">Departure Time</Label>
                  <Input
                    id="deptTime"
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    min={trip?.start_date ? `${trip.start_date}T00:00` : undefined}
                    max={trip?.end_date ? `${trip.end_date}T23:59` : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrTime">Arrival Time</Label>
                  <Input
                    id="arrTime"
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    min={trip?.start_date ? `${trip.start_date}T00:00` : undefined}
                    max={trip?.end_date ? `${trip.end_date}T23:59` : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingRef">Booking Reference</Label>
                <Input
                  id="bookingRef"
                  value={formData.bookingReference}
                  onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
                  placeholder="Booking code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Add Transport
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transports.map((transport) => (
          <Card key={transport.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white/70 backdrop-blur-sm">
            <div className="h-3 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-inner">
                    {getTransportIcon(transport.type)}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-display font-bold">{transport.departure} → {transport.arrival}</CardTitle>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 uppercase text-[10px] tracking-wider mt-1">
                      {transport.type}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => deleteMutation.mutate(transport.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Départ</p>
                  <p className="text-sm font-semibold">{transport.departureTime.split('T')[0]}</p>
                  <p className="text-lg font-mono font-bold text-blue-600">{transport.departureTime.split('T')[1] || ''}</p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="w-full h-px bg-slate-200 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      {getTransportIcon(transport.type)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Arrivée</p>
                  <p className="text-sm font-semibold">{transport.arrivalTime.split('T')[0]}</p>
                  <p className="text-lg font-mono font-bold text-blue-600">{transport.arrivalTime.split('T')[1] || ''}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Prix payé</span>
                  <span className="text-xl font-display font-bold text-slate-900">{transport.price} {transport.currency}</span>
                </div>
                {transport.bookingReference && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block leading-none">Référence</span>
                    <span className="text-sm font-mono text-slate-600">{transport.bookingReference}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No transports added yet</p>
        </div>
      )}
    </div>
  );
}
