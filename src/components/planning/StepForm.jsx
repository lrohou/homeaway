import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const stepTypes = [
  { value: "flight", label: "✈️ Vol" },
  { value: "train", label: "🚄 Train" },
  { value: "hotel", label: "🏨 Hôtel" },
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "activity", label: "🎯 Activité" },
  { value: "transport", label: "🚗 Transport" },
  { value: "other", label: "📌 Autre" },
];

export default function StepForm({ open, onOpenChange, onSubmit, step, tripId }) {
  const [form, setForm] = useState(
    step || {
      trip_id: tripId,
      title: "",
      type: "activity",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      latitude: null,
      longitude: null,
      notes: "",
      booking_reference: "",
      price: "",
    }
  );
  const [saving, setSaving] = useState(false);

  const handleAddressSelect = (data) => {
    setForm(f => ({
      ...f,
      location: data.address,
      latitude: data.lat,
      longitude: data.lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      ...form,
      trip_id: tripId,
      price: form.price ? Number(form.price) : undefined,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step ? "Modifier l'étape" : "Nouvelle étape"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Titre *</Label>
            <Input
              placeholder="Ex: Vol Paris → Barcelone"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stepTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Heure début</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure fin</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lieu / Adresse</Label>
            <AddressAutocomplete
              defaultValue={form.location}
              onSelect={handleAddressSelect}
              placeholder="Rechercher une adresse (pour la carte)..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Réf. réservation</Label>
              <Input
                placeholder="ABC123"
                value={form.booking_reference}
                onChange={(e) => setForm((f) => ({ ...f, booking_reference: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Informations complémentaires..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {step ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}