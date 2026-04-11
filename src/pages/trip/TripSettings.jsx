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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, UserPlus, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function TripSettings() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [memberInput, setMemberInput] = useState("");

  const { data: trip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

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

  const handleDelete = async () => {
    try {
      await api.trips.delete(tripId);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({ title: "Voyage supprimé" });
      navigate("/");
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl">
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
    </div>
  );
}