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

  // Populate share form when settings loaded
  useEffect(() => {
    if (shareSettings) {
      setShareForm({
        share_accommodations: shareSettings.share_accommodations,
        share_transports: shareSettings.share_transports,
        share_activities: shareSettings.share_activities,
        cover_image: shareSettings.cover_image || "",
        comments: shareSettings.comments || "",
      });
    }
  }, [shareSettings]);

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
      toast({ title: "Voyage mis à jour avec succès" });
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleShareSubmit = async () => {
    setSavingShare(true);
    try {
      await api.community.share({
        trip_id: Number(tripId),
        ...shareForm,
      });
      await refetchShareSettings();
      queryClient.invalidateQueries({ queryKey: ["community-trips"] });
      toast({ title: t('community.shareBtn'), description: "Votre voyage est maintenant visible dans la communauté !" });
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSavingShare(false);
    }
  };

  const handleUnshare = async () => {
    setUnsharingTrip(true);
    try {
      await api.community.unshare(tripId);
      await refetchShareSettings();
      queryClient.invalidateQueries({ queryKey: ["community-trips"] });
      toast({ title: t('community.unshareBtn'), description: "Votre voyage n'est plus visible dans la communauté." });
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUnsharingTrip(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.trips.delete(tripId);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({ title: "Voyage supprimé" });
      navigate("/");
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };  return (
    <div className="max-w-2xl space-y-10">
      <h2 className="text-3xl font-bold">Paramètres</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Titre du voyage</Label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date de début</Label>
            <Input
              type="date"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Date de fin</Label>
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
            <Label>Budget</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Devise</Label>
            <Input
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="h-11"
            />
          </div>
        </div>

        {/* Members / Collaboration */}
        <div className="space-y-3 border-t border-border pt-6">
          <Label className="text-base font-semibold">Membres du voyage</Label>
          <p className="text-sm text-muted-foreground">
            Invitez des amis pour planifier ensemble.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Email du membre"
              value={memberInput}
              onChange={e => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
              className="h-11"
            />
            <Button type="button" variant="outline" onClick={addMember} className="shrink-0 h-11 gap-1.5">
              <UserPlus className="w-4 h-4" />
              Inviter
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
            Enregistrer
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5">
                <Trash2 className="w-4 h-4" />
                Supprimer le voyage
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce voyage ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les étapes, documents et dépenses seront supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Supprimer
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

          {/* Toggle checkboxes */}
          <div className="space-y-3 bg-secondary/30 rounded-2xl p-5">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('community.selectShared')}</Label>
            <div className="space-y-3 mt-2">
              {[
                { key: 'share_accommodations', label: t('community.accommodations'), emoji: '🏠' },
                { key: 'share_transports', label: t('community.transports'), emoji: '✈️' },
                { key: 'share_activities', label: t('community.activities'), emoji: '🎯' },
              ].map(({ key, label, emoji }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span>{emoji}</span>{label}
                  </span>
                  <Switch
                    checked={shareForm[key]}
                    onCheckedChange={(v) => setShareForm(f => ({ ...f, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cover image */}
          <div className="space-y-2">
            <Label>{t('community.coverImage')}</Label>
            <Input
              placeholder="https://example.com/photo.jpg"
              value={shareForm.cover_image}
              onChange={e => setShareForm(f => ({ ...f, cover_image: e.target.value }))}
              className="h-11"
            />
            {shareForm.cover_image && (
              <div className="mt-2 rounded-xl overflow-hidden h-32 bg-secondary">
                <img src={shareForm.cover_image} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
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