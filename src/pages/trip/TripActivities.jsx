import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Clock, MapPin, Trash2, DollarSign } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { useAuth } from '@/lib/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/LanguageContext';
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function TripActivities() {
  const { tripId } = useParams();
  const { t, lang } = useTranslation();
  const dateLocale = lang === 'fr' ? fr : enUS;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    duration: '',
    price: '',
    currency: 'EUR',
    latitude: '',
    longitude: '',
    description: '',
    location: '',
    paid_by: '',
    participants: []
  });
  const { user } = useAuth();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', tripId],
    queryFn: () => api.activities.list(tripId),
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
      const res = await api.activities.create(tripId, data.payload);
      const userIds = data.participants?.length > 0 ? data.participants : tripMembers.map(m => m.user_id);
      await api.participants.set(tripId, {
        booking_type: 'activity',
        booking_id: res.id,
        user_ids: userIds.filter(Boolean)
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
      queryClient.invalidateQueries({ queryKey: ['participants', tripId] });
      setIsOpen(false);
      setFormData({
        name: '',
        date: '',
        time: '',
        duration: '',
        price: '',
        currency: 'EUR',
        latitude: '',
        longitude: '',
        description: '',
        location: '',
        paid_by: '',
        participants: []
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.activities.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities', tripId] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      payload: {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        duration: formData.duration ? parseInt(formData.duration) : 60,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
        location: formData.location || '',
        paid_by: formData.paid_by === 'none' || !formData.paid_by ? null : Number(formData.paid_by)
      },
      participants: formData.participants
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('activities.title')}</h1>
          <p className="text-gray-600 mt-1">{t('activities.subtitle')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto h-11 sm:h-auto shadow-md">
              <Plus className="w-5 h-5" />
              {t('activities.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('activities.new')}</DialogTitle>
              <DialogDescription>{t('activities.newDesc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('activities.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Louvre Museum Tour"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t('activities.date')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={trip?.start_date}
                    max={trip?.end_date}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">{t('activities.time')}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">{t('activities.duration')}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('activities.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Activity details"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('activities.price')}</Label>
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
                      {tripMembers.map((m) => (
                        <SelectItem key={m.user_id || m.email} value={String(m.user_id || m.email)}>{m.name || m.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border mt-3">
                <Label>{t('planning.forWho')}</Label>
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
                <Label htmlFor="actLocation">{t('activities.location')}</Label>
                <AddressAutocomplete
                  defaultValue={formData.location}
                  placeholder={t('activities.locationPlaceholder')}
                  onSelect={({ address, lat, lng }) => setFormData({ ...formData, location: address, latitude: lat, longitude: lng })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {t('activities.add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((act) => (
          <Card key={act.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white/70 backdrop-blur-sm">
            <div className="h-3 bg-gradient-to-r from-orange-400 to-amber-500" />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100 uppercase text-[10px] tracking-wider">
                      {t('cat.activity')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-display font-bold leading-tight">{act.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{act.location || t('activities.locationPlaceholder')}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-500"
                    onClick={() => deleteMutation.mutate(act.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('activities.date')}</p>
                  <p className="text-sm font-semibold">{act.date ? format(parseISO(act.date), "d MMM yyyy", { locale: dateLocale }) : '—'}</p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('activities.time')}</p>
                  <p className="text-sm font-semibold">{act.time || '—'} {act.duration ? `(${act.duration}m)` : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex flex-col">
                  {act.price > 0 && (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('activities.price')}</span>
                      <span className="text-xl font-display font-bold text-slate-900">{act.price} {act.currency}</span>
                    </>
                  )}
                </div>
              </div>
              
            </CardContent>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('activities.empty')}</p>
        </div>
      )}
    </div>
  );
}
