import React, { useState } from 'react';
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
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

export default function TripActivities() {
  const { tripId } = useParams();
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
    location: ''
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', tripId],
    queryFn: () => api.activities.list(tripId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.activities.create(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
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
        location: ''
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
      ...formData,
      price: formData.price ? parseFloat(formData.price) : 0,
      duration: formData.duration ? parseInt(formData.duration) : 60,
      latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
      longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
      location: formData.location || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-gray-600 mt-1">Plan your trip activities and tours</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
              <DialogDescription>Add a tour or activity to your trip</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Activity Name</Label>
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
                  <Label htmlFor="date">Date</Label>
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
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Activity details"
                  rows={3}
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
              <div className="space-y-2">
                <Label htmlFor="actLocation">Lieu</Label>
                <AddressAutocomplete
                  defaultValue={formData.location}
                  placeholder="Rechercher l'adresse de l'activité..."
                  onSelect={({ address, lat, lng }) => setFormData({ ...formData, location: address, latitude: lat, longitude: lng })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Add Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{activity.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(activity.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{activity.date}</span>
              </div>
              {activity.time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{activity.time} {activity.duration && `(${activity.duration} min)`}</span>
                </div>
              )}
              {activity.description && (
                <p className="text-sm text-gray-600">{activity.description}</p>
              )}
              {activity.price > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>{activity.price} {activity.currency}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No activities added yet</p>
        </div>
      )}
    </div>
  );
}
