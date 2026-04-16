import React, { useState, useMemo } from 'react';
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
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/LanguageContext';

export default function TripTransports() {
  const { tripId } = useParams();
  const { t } = useTranslation();
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
    longitude: '',
    paid_by: ''
  });
  const { user } = useAuth();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: transports = [] } = useQuery({
    queryKey: ['transports', tripId],
    queryFn: () => api.transports.list(tripId),
  });

  const tripMembers = useMemo(() => {
    const m = [user?.email];
    if (trip?.members) {
      if (typeof trip.members[0] === "string") {
        m.push(...trip.members);
      } else {
        m.push(...trip.members.map(x => x.email || x));
      }
    }
    return [...new Set(m)].filter(Boolean);
  }, [trip, user]);

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
        longitude: '',
        paid_by: ''
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
          <h1 className="text-3xl font-bold">{t('transports.title')}</h1>
          <p className="text-gray-600 mt-1">{t('transports.subtitle')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('transports.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('transports.new')}</DialogTitle>
              <DialogDescription>{t('transports.newDesc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('transports.type')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">{t('cat.flight')}</SelectItem>
                    <SelectItem value="train">{t('cat.train')}</SelectItem>
                    <SelectItem value="bus">{t('cat.bus')}</SelectItem>
                    <SelectItem value="car">{t('cat.car')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure">{t('transports.departure')}</Label>
                  <Input
                    id="departure"
                    value={formData.departure}
                    onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                    placeholder="CDG, NYC, etc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival">{t('transports.arrival')}</Label>
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
                  <Label htmlFor="deptTime">{t('transports.departureTime')}</Label>
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
                  <Label htmlFor="arrTime">{t('transports.arrivalTime')}</Label>
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
                <Label htmlFor="bookingRef">{t('transports.bookingRef')}</Label>
                <Input
                  id="bookingRef"
                  value={formData.bookingReference}
                  onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
                  placeholder={t('transports.bookingRef')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('transports.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid_by">{t('expenses.paidBy')} ({t('expenses.optional')})</Label>
                  <Select value={formData.paid_by} onValueChange={(value) => setFormData({ ...formData, paid_by: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('expenses.autoSystem')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('expenses.autoSystem')}</SelectItem>
                      {tripMembers.map((email) => (
                        <SelectItem key={email} value={email}>{email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destAddress">{t('transports.destAddress')}</Label>
                <AddressAutocomplete
                  defaultValue=""
                  placeholder={t('transports.destPlaceholder')}
                  onSelect={({ address, lat, lng }) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {t('transports.add')}
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
                      {t(`cat.${transport.type}`)}
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('planning.departure')}</p>
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('planning.arrival')}</p>
                  <p className="text-sm font-semibold">{transport.arrivalTime.split('T')[0]}</p>
                  <p className="text-lg font-mono font-bold text-blue-600">{transport.arrivalTime.split('T')[1] || ''}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('transports.price')}</span>
                  <span className="text-xl font-display font-bold text-slate-900">{transport.price} {transport.currency}</span>
                </div>
                {transport.bookingReference && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block leading-none">{t('transports.bookingRef')}</span>
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
          <p className="text-gray-500">{t('transports.empty')}</p>
        </div>
      )}
    </div>
  );
}
