import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, eachDayOfInterval, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Upload, Loader2, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StepForm from "@/components/planning/StepForm";
import TimelineItem from "@/components/planning/TimelineItem";
import DocumentUploadDialog from "@/components/documents/DocumentUploadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function TripPlanning() {
  const { tripId } = useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const { data: trip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ["steps", tripId],
    queryFn: () => api.tripSteps.list(tripId),
  });

  const { data: accommodations = [], isLoading: accLoading } = useQuery({
    queryKey: ["accommodations", tripId],
    queryFn: () => api.accommodations.list(tripId),
  });

  const { data: activities = [], isLoading: actLoading } = useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => api.activities.list(tripId),
  });

  const { data: transports = [], isLoading: transLoading } = useQuery({
    queryKey: ["transports", tripId],
    queryFn: () => api.transports.list(tripId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.tripSteps.create(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steps", tripId] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.tripSteps.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steps", tripId] });
      setEditingStep(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.tripSteps.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steps", tripId] });
    },
  });

  // Convert bookings to timeline items
  const allItems = useMemo(() => {
    const items = [...steps];

    // Add accommodations (convert checkIn/checkOut to steps)
    accommodations.forEach((acc) => {
      const checkInDate = acc.checkIn;
      const checkOutDate = acc.checkOut;
      
      // Add check-in event
      items.push({
        id: `acc-checkin-${acc.id}`,
        trip_id: tripId,
        type: "hotel",
        title: `Check-in: ${acc.name}`,
        date: checkInDate,
        start_time: "10:00",
        location: acc.location,
        booking_reference: acc.bookingReference,
        price: acc.price,
        notes: `Check-in at ${acc.name}. Address: ${acc.location}`,
        _sourceType: "accommodation",
        _sourceId: acc.id,
      });

      // Add check-out event on last day
      const checkOutDate_adjusted = new Date(checkOutDate);
      checkOutDate_adjusted.setDate(checkOutDate_adjusted.getDate() - 1);
      items.push({
        id: `acc-checkout-${acc.id}`,
        trip_id: tripId,
        type: "hotel",
        title: `Check-out: ${acc.name}`,
        date: format(checkOutDate_adjusted, "yyyy-MM-dd"),
        start_time: "11:00",
        location: acc.location,
        booking_reference: acc.bookingReference,
        price: null,
        notes: `Check-out from ${acc.name}`,
        _sourceType: "accommodation",
        _sourceId: acc.id,
      });
    });

    // Add activities
    activities.forEach((act) => {
      items.push({
        id: `act-${act.id}`,
        trip_id: tripId,
        type: "activity",
        title: act.name,
        date: act.date,
        start_time: act.time,
        location: act.location,
        price: act.price > 0 ? act.price : null,
        notes: act.description,
        _sourceType: "activity",
        _sourceId: act.id,
      });
    });

    // Add transports
    transports.forEach((trans) => {
      const departTime = new Date(trans.departureTime);
      const departDate = format(departTime, "yyyy-MM-dd");
      const departTimeStr = format(departTime, "HH:mm");

      const transType = trans.type === "flight" ? "flight" : trans.type === "train" ? "train" : "transport";
      
      items.push({
        id: `trans-${trans.id}`,
        trip_id: tripId,
        type: transType,
        title: `${trans.departure} → ${trans.arrival}`.toUpperCase(),
        date: departDate,
        start_time: departTimeStr,
        location: trans.departure,
        booking_reference: trans.bookingReference,
        price: trans.price,
        notes: `Arrival: ${trans.arrival} at ${format(new Date(trans.arrivalTime), "HH:mm")}`,
        _sourceType: "transport",
        _sourceId: trans.id,
      });
    });

    return items;
  }, [steps, accommodations, activities, transports, tripId]);

  // Group all items (steps + bookings) by day
  const dayGroups = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return [];
    const days = eachDayOfInterval({
      start: parseISO(trip.start_date),
      end: parseISO(trip.end_date),
    });
    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayItems = allItems
        .filter((item) => item.date === dateStr)
        .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

      // Find if there's an active accommodation for this day
      const currentAcc = accommodations.find(acc => {
        const start = parseISO(acc.checkIn);
        const end = parseISO(acc.checkOut);
        return day >= start && day < end;
      });

      return { date: day, dateStr, steps: dayItems, currentAccommodation: currentAcc };
    });
  }, [trip, allItems, accommodations]);

  const handleSubmit = async (data) => {
    if (editingStep) {
      await updateMutation.mutateAsync({ id: editingStep.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    setShowForm(true);
  };

  const handleDelete = async (step) => {
    await deleteMutation.mutateAsync(step.id);
  };

  if (!trip) return null;

  return (
    <div>
      {/* Trip header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{trip.title}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(parseISO(trip.start_date), "d MMMM", { locale: fr })} — {format(parseISO(trip.end_date), "d MMMM yyyy", { locale: fr })}
            {trip.destinations?.length > 0 && ` · ${trip.destinations.join(" → ")}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowUpload(true)}
          >
            <Upload className="w-4 h-4" />
            Importer
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => { setEditingStep(null); setShowForm(true); }}
          >
            <Plus className="w-4 h-4" />
            Ajouter une étape
          </Button>
        </div>
      </div>

      {/* Timeline by day */}
      {stepsLoading || accLoading || actLoading || transLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {dayGroups.map((group, gi) => (
            <motion.div
              key={group.dateStr}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: gi * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display font-semibold text-lg text-foreground capitalize">
                  {format(group.date, "EEEE d MMMM", { locale: fr })}
                </h3>
                {group.currentAccommodation && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1">
                    <BedDouble className="w-3.5 h-3.5" />
                    {group.currentAccommodation.name}
                  </Badge>
                )}
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  {group.steps.length} étape{group.steps.length !== 1 ? "s" : ""}
                </span>
              </div>

              {group.steps.length === 0 ? (
                <div className="text-sm text-muted-foreground pl-14 py-2">
                  Aucune étape prévue
                </div>
              ) : (
                <div>
                  {group.steps.map((step, si) => (
                    <TimelineItem
                      key={step.id}
                      step={step}
                      index={si}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <StepForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        step={editingStep}
        tripId={tripId}
      />

      <DocumentUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        tripId={tripId}
      />
    </div>
  );
}