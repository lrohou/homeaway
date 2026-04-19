import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, DollarSign, CalendarDays, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { useAuth } from '@/lib/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/LanguageContext';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function TripAccommodations() {
  const { tripId } = useParams();
  const { t, lang } = useTranslation();
  const dateLocale = lang === 'fr' ? fr : enUS;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    checkIn: '',
    checkOut: '',
    price: '',
    currency: 'EUR',
    bookingReference: '',
    latitude: '',
    longitude: '',
    paid_by: '',
    participants: []
  });
  const { user } = useAuth();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: accommodations = [] } = useQuery({
    queryKey: ['accommodations', tripId],
    queryFn: () => api.accommodations.list(tripId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => api.members.list(tripId),
  });

  const tripMembers = useMemo(() => {
    if (members.length > 0) return members;
    return [{ user_id: user?.id, email: user?.email, name: user?.name }];
  }, [members, user]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.accommodations.create(tripId, data.payload);
      const userIds = data.participants?.length > 0 ? data.participants : tripMembers.map(m => m.user_id);
      await api.participants.set(tripId, {
        booking_type: 'accommodation',
        booking_id: res.id,
        user_ids: userIds.filter(Boolean)
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      queryClient.invalidateQueries({ queryKey: ['participants', tripId] });
      setIsOpen(false);
      setFormData({
        name: '',
        location: '',
        checkIn: '',
        checkOut: '',
        price: '',
        currency: 'EUR',
        latitude: '',
        longitude: '',
        paid_by: '',
        participants: []
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.accommodations.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      payload: {
        ...formData,
        price: parseFloat(formData.price),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        paid_by: formData.paid_by === 'none' || !formData.paid_by ? null : Number(formData.paid_by)
      },
      participants: formData.participants
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('accommodations.title')}</h1>
          <p className="text-gray-600 mt-1">{t('accommodations.subtitle')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto h-11 sm:h-auto shadow-md">
              <Plus className="w-5 h-5" />
              {t('accommodations.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('accommodations.new')}</DialogTitle>
              <DialogDescription>{t('accommodations.newDesc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('accommodations.nameLabel')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hotel name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t('accommodations.addressLabel')}</Label>
                <AddressAutocomplete
                  defaultValue={formData.location}
                  placeholder={t('accommodations.addressPlaceholder')}
                  onSelect={({ address, lat, lng }) => setFormData({ ...formData, location: address, latitude: lat, longitude: lng })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">{t('accommodations.checkIn')}</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={trip?.start_date}
                    max={trip?.end_date}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">{t('accommodations.checkOut')}</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={trip?.start_date}
                    max={trip?.end_date}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('accommodations.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
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
                      {tripMembers.map((m) => (
                        <SelectItem key={m.user_id || m.email} value={String(m.user_id || m.email)}>{m.name || m.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border mt-3">
                <Label>Pour qui ? (par défaut : tout le monde)</Label>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto mt-2">
                  {tripMembers.map(m => (
                    <label key={m.user_id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-md">
                      <input
                        type="checkbox"
                        checked={formData.participants?.includes(m.user_id) || (!formData.participants?.length && true)}
                        onChange={(e) => {
                          let current = [...(formData.participants || tripMembers.map(tm => tm.user_id))];
                          if (e.target.checked) current.push(m.user_id);
                          else current = current.filter(id => id !== m.user_id);
                          setFormData(f => ({ ...f, participants: current }));
                        }}
                        className="rounded border-slate-300 w-4 h-4 text-primary focus:ring-primary/20"
                      />
                      {m.name || m.email}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingRef">{t('accommodations.bookingRef')}</Label>
                <Input
                  id="bookingRef"
                  value={formData.bookingReference}
                  onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
                  placeholder={t('accommodations.bookingRef')}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {t('accommodations.add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((acc) => (
          <Card key={acc.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white/70 backdrop-blur-sm">
            <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px] tracking-wider">
                      {t('cat.hotel')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-display font-bold leading-tight">{acc.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{acc.location}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-500"
                    onClick={() => deleteMutation.mutate(acc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('accommodations.checkIn')}</p>
                  <p className="text-sm font-semibold">{format(parseISO(acc.checkIn), "d MMM yyyy", { locale: dateLocale })}</p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('accommodations.checkOut')}</p>
                  <p className="text-sm font-semibold">{format(parseISO(acc.checkOut), "d MMM yyyy", { locale: dateLocale })}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('accommodations.price')}</span>
                  <span className="text-xl font-display font-bold text-slate-900">{acc.price} {acc.currency}</span>
                </div>
                {acc.bookingReference && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block leading-none">{t('accommodations.bookingRef')}</span>
                    <span className="text-sm font-mono text-slate-600">{acc.bookingReference}</span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full rounded-2xl border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                asChild
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acc.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t('map.goThere')}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {accommodations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('accommodations.empty')}</p>
        </div>
      )}
    </div>
  );
}
