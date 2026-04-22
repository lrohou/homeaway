import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, UserPlus, X, Save, Globe, Globe2, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/LanguageContext";

export default function TripSettings() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [memberInput, setMemberInput] = useState("");

  // Community sharing state
  const [shareForm, setShareForm] = useState({
    share_accommodations: true,
    share_transports: true,
    share_activities: true,
    cover_image: "",
    comments: "",
    bookings: [],
  });
  const [savingShare, setSavingShare] = useState(false);
  const [unsharingTrip, setUnsharingTrip] = useState(false);

  const { data: trip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: shareSettings, refetch: refetchShareSettings } = useQuery({
    queryKey: ["share-settings", tripId],
    queryFn: () => api.community.getSettings(tripId),
    retry: false,
  });

  const { data: accommodations = [] } = useQuery({ queryKey: ['accommodations', tripId], queryFn: () => api.accommodations.list(tripId) });
  const { data: transports = [] } = useQuery({ queryKey: ['transports', tripId], queryFn: () => api.transports.list(tripId) });
  const { data: activities = [] } = useQuery({ queryKey: ['activities', tripId], queryFn: () => api.activities.list(tripId) });

  // Populate share form when settings loaded
  useEffect(() => {
    if (shareSettings === null || shareSettings === undefined) return;
    // Build bookings from saved selections
    const savedBookings = shareSettings.bookings || [];
    const bookingMap = {};
    savedBookings.forEach(b => { bookingMap[`${b.booking_type}_${b.booking_id}`] = b; });

    // Build default bookings list from all reservations
    const allBookings = [
      ...accommodations.map(a => ({ booking_type: 'accommodation', booking_id: a.id, label: a.name, is_shared: bookingMap[`accommodation_${a.id}`]?.is_shared ?? true, review: bookingMap[`accommodation_${a.id}`]?.review || '' })),
      ...transports.map(t => ({ booking_type: 'transport', booking_id: t.id, label: `${t.departure} → ${t.arrival}`, is_shared: bookingMap[`transport_${t.id}`]?.is_shared ?? true, review: bookingMap[`transport_${t.id}`]?.review || '' })),
      ...activities.map(a => ({ booking_type: 'activity', booking_id: a.id, label: a.name, is_shared: bookingMap[`activity_${a.id}`]?.is_shared ?? true, review: bookingMap[`activity_${a.id}`]?.review || '' })),
    ];

    setShareForm(f => ({
      ...f,
      cover_image: shareSettings?.cover_image || '',
      comments: shareSettings?.comments || '',
      bookings: allBookings,
    }));
  }, [shareSettings, accommodations, transports, activities]);

  // Also init bookings when no settings yet
  useEffect(() => {
    if (shareSettings !== null && shareSettings !== undefined) return;
    if (shareForm.bookings.length > 0) return;
    const allBookings = [
      ...accommodations.map(a => ({ booking_type: 'accommodation', booking_id: a.id, label: a.name, is_shared: true, review: '' })),
      ...transports.map(t => ({ booking_type: 'transport', booking_id: t.id, label: `${t.departure} → ${t.arrival}`, is_shared: true, review: '' })),
      ...activities.map(a => ({ booking_type: 'activity', booking_id: a.id, label: a.name, is_shared: true, review: '' })),
    ];
    if (allBookings.length > 0) setShareForm(f => ({ ...f, bookings: allBookings }));
  }, [accommodations, transports, activities, shareSettings]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'EUR',
    members: [],
  });

  useEffect(() => {
    if (trip?.name && form.title === '') {
      setForm({
        title: trip.name || "",
        description: trip.description || "",
        start_date: trip.start_date || "",
        end_date: trip.end_date || "",
        budget: trip.budget || "",
        currency: trip.currency || "EUR",
        members: trip.members || [],
      });
    }
  }, [trip]);

  const addMember = () => {
    const email = memberInput.trim().toLowerCase();
    if (email && form && !form.members.includes(email)) {
      setForm((f) => ({ ...f, members: [...f.members, email] }));
      setMemberInput("");
    }
  };

  const removeMember = (email) => {
    setForm((f) => ({ ...f, members: f.members.filter((m) => m !== email) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.trips.update(tripId, {
        name: form.title,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({ title: t('settings.save') });
    } catch (err) {
      toast({ title: t('common.error'), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleShareSubmit = async () => {
    setSavingShare(true);
    try {
      await api.community.share({
        trip_id: Number(tripId),
        cover_image: shareForm.cover_image,
        comments: shareForm.comments,
        bookings: shareForm.bookings,
      });
      await refetchShareSettings();
      queryClient.invalidateQueries({ queryKey: ["community-trips"] });
      toast({ title: t('community.shareBtn') });
    } catch (err) {
      toast({ title: t('common.error'), description: err.message, variant: "destructive" });
    } finally {
      setSavingShare(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: t('common.error'), description: t('common.error') + ': 2MB max', variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setShareForm(f => ({ ...f, cover_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnshare = async () => {
    setUnsharingTrip(true);
    try {
      await api.community.unshare(tripId);
      await refetchShareSettings();
      queryClient.invalidateQueries({ queryKey: ["community-trips"] });
      toast({ title: t('community.unshareBtn') });
    } catch (err) {
      toast({ title: t('common.error'), description: err.message, variant: "destructive" });
    } finally {
      setUnsharingTrip(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.trips.delete(tripId);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({ title: t('settings.delete') });
      navigate("/");
    } catch (err) {
      toast({ title: t('common.error'), description: err.message, variant: "destructive" });
    }
  };
  return (
    <div className="max-w-2xl space-y-10">
      <h2 className="text-3xl font-bold">{t('settings.title')}</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>{t('newTrip.title')}</Label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('newTrip.description')}</Label>
          <Textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('newTrip.startDatePlaceholder')}</Label>
            <Input
              type="date"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('newTrip.endDate')}</Label>
            <Input
              type="date"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('newTrip.budget')}</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.currency')}</Label>
            <Input
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="h-11"
            />
          </div>
        </div>

        {/* Members / Collaboration */}
        <div className="space-y-3 border-t border-border pt-6">
          <Label className="text-base font-semibold">{t('members.title')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('members.inviteDesc')}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder={t('members.emailLabel')}
              value={memberInput}
              onChange={e => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
              className="h-11"
            />
            <Button type="button" variant="outline" onClick={addMember} className="shrink-0 h-11 gap-1.5 transition-all hover:scale-105 active:scale-95">
              <UserPlus className="w-4 h-4" />
              {t('members.invite')}
            </Button>
          </div>
          {form.members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.members.map((email) => (
                <Badge key={email} variant="secondary" className="pl-3 pr-1.5 py-1.5 gap-1.5">
                  {email}
                  <button onClick={() => removeMember(email)} className="hover:bg-foreground/10 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('settings.save')}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5 transition-all hover:scale-105 active:scale-95">
                <Trash2 className="w-4 h-4" />
                {t('settings.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings.deleteConfirm')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('settings.deleteDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('settings.deleteCancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {t('settings.deleteYes')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ─── Community Sharing Section ─── */}
      {trip?.owner_id === user?.id && (
        <div className="border-t border-border pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {t('community.shareTitle')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{t('community.shareDesc')}</p>
            </div>
            {shareSettings && (
              <Badge className="bg-primary/10 text-primary border-primary/20">Partagé</Badge>
            )}
          </div>

          {/* Per-booking switches */}
          <div className="space-y-4 bg-secondary/30 rounded-2xl p-5">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('community.selectShared')}</p>
            {shareForm.bookings.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Aucune réservation à partager pour l'instant.</p>
            )}
            {[['accommodation', '🏠', 'Logements'], ['transport', '✈️', 'Transports'], ['activity', '🎯', 'Activités']].map(([type, emoji, label]) => {
              const items = shareForm.bookings.filter(b => b.booking_type === type);
              if (!items.length) return null;
              return (
                <div key={type} className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">{emoji} {label}</p>
                  {items.map((booking, idx) => {
                    const bookingIndex = shareForm.bookings.findIndex(b => b.booking_type === booking.booking_type && b.booking_id === booking.booking_id);
                    return (
                      <div key={`${booking.booking_type}_${booking.booking_id}`} className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-3">
                          <span className="text-sm font-medium truncate flex-1 mr-2">{booking.label}</span>
                          <Switch
                            checked={booking.is_shared}
                            onCheckedChange={(v) => setShareForm(f => {
                              const newBookings = [...f.bookings];
                              newBookings[bookingIndex] = { ...newBookings[bookingIndex], is_shared: v };
                              return { ...f, bookings: newBookings };
                            })}
                          />
                        </div>
                        {booking.is_shared && (
                          <div className="px-3 pb-3">
                            <input
                              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="Avis optionnel sur cette réservation..."
                              value={booking.review}
                              onChange={(e) => setShareForm(f => {
                                const newBookings = [...f.bookings];
                                newBookings[bookingIndex] = { ...newBookings[bookingIndex], review: e.target.value };
                                return { ...f, bookings: newBookings };
                              })}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Cover image */}
          <div className="space-y-3">
            <Label>{t('community.coverImage')} (Optionnel)</Label>
            <div className="flex flex-col gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer file:text-sm file:font-semibold file:text-primary file:bg-primary/10 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 hover:file:bg-primary/20"
              />
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Ou via URL</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <Input
                placeholder="https://example.com/photo.jpg"
                value={shareForm.cover_image}
                onChange={e => setShareForm(f => ({ ...f, cover_image: e.target.value }))}
                className="h-11"
              />
            </div>
            {shareForm.cover_image && (
              <div className="mt-4 rounded-xl overflow-hidden h-40 bg-secondary border border-border">
                <img src={shareForm.cover_image} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label>{t('community.comments')}</Label>
            <Textarea
              placeholder="Partagez vos impressions, conseils et avis sur ce voyage..."
              value={shareForm.comments}
              onChange={e => setShareForm(f => ({ ...f, comments: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleShareSubmit}
              disabled={savingShare}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {savingShare ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe2 className="w-4 h-4" />}
              {shareSettings ? t('community.updateBtn') : t('community.shareBtn')}
            </Button>

            {shareSettings && (
              <Button
                variant="outline"
                onClick={handleUnshare}
                disabled={unsharingTrip}
                className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5"
              >
                {unsharingTrip ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                {t('community.unshareBtn')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
