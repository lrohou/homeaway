import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/lib/LanguageContext";

export default function NewTrip() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    location_name: "",
    location_lat: "",
    location_lng: "",
    budget: "",
    cover_image: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('common.required')} <a href="/login" className="underline">Connexion</a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Validate required fields
      if (!form.name.trim() || !form.start_date || !form.end_date) {
        setError(t('common.required'));
        setSaving(false);
        return;
      }

      // Validate dates
      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);
      if (endDate <= startDate) {
        setError(t('common.invalidDate'));
        setSaving(false);
        return;
      }

      // Call API with real endpoint
      console.log("Creating trip with data:", form);
      const response = await api.trips.create({
        ...form,
        budget: form.budget ? Number(form.budget) : null
      });
      console.log("Trip created:", response);

      navigate(`/trip/${response.id}/planning`);
    } catch (err) {
      console.error("Trip creation error:", err);
      setError(err.message || t('common.error'));
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("L'image est trop volumineuse (max 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, cover_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('trip.backToTrips')}
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('app.newTrip')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('newTrip.name')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder={t('newTrip.namePlaceholder') || "Ex: Vacances à Barcelone"}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-12"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('newTrip.description')}</Label>
          <Textarea
            id="description"
            placeholder={t('newTrip.descriptionPlaceholder') || "Décrivez votre voyage..."}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">
              {t('newTrip.startDate')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">
              {t('newTrip.endDate')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="h-12"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location_name">{t('newTrip.location')}</Label>
          <Input
            id="location_name"
            placeholder={t('dashboard.locationPlaceholder') || "Ex: Barcelone, Espagne"}
            value={form.location_name}
            onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))}
            className="h-12"
          />
        </div>

        {/* Coordinates (optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location_lat">{t('newTrip.latitude')}</Label>
            <Input
              id="location_lat"
              type="number"
              step="0.0001"
              placeholder="41.3874"
              value={form.location_lat}
              onChange={(e) => setForm((f) => ({ ...f, location_lat: e.target.value }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location_lng">{t('newTrip.longitude')}</Label>
            <Input
              id="location_lng"
              type="number"
              step="0.0001"
              placeholder="2.1686"
              value={form.location_lng}
              onChange={(e) => setForm((f) => ({ ...f, location_lng: e.target.value }))}
              className="h-11"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget">{t('newTrip.budget')}</Label>
          <Input
            id="budget"
            type="number"
            step="1"
            placeholder="Ex: 1000"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            className="h-12"
          />
        </div>

        {/* Cover Image */}
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
              value={form.cover_image}
              onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
              className="h-12"
            />
          </div>
          {form.cover_image && (
            <div className="mt-4 rounded-xl overflow-hidden h-40 bg-secondary border border-border">
              <img src={form.cover_image} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1 h-12"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={saving || !form.name.trim() || !form.start_date || !form.end_date}
            className="flex-1 h-12"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving ? t('common.creating') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}