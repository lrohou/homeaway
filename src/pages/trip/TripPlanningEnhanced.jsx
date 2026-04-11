import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// TODO: Remplacer par api sécurisé
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Trash2, Clock, MapPin } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TripPlanningEnhanced() {
  const { tripId } = useParams();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // timeline or list
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    type: 'activity'
  });

  const { data: steps = [] } = useQuery({
    queryKey: ['planning', tripId],
    // TODO: Remplacer par api.tripSteps.list(tripId)
  });

  const { data: trip = {} } = useQuery({
    queryKey: ['trip', tripId],
    // TODO: Remplacer par api.trips.get(tripId)
  });

  const createMutation = useMutation({
    // TODO: Remplacer par api.tripSteps.create(tripId, ...)
    onSuccess: () => {
      queryClient.invalidateQueries(['planning', tripId]);
      setFormData({ title: '', date: '', description: '', type: 'activity' });
      setIsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    // TODO: Remplacer par api.tripSteps.delete(id)
    onSuccess: () => queryClient.invalidateQueries(['planning', tripId])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.date) {
      createMutation.mutate(formData);
    }
  };

  // Sort steps by date
  const sortedSteps = [...steps].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by date
  const groupedByDate = sortedSteps.reduce((acc, step) => {
    const date = step.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(step);
    return acc;
  }, {});

  const getTypeColor = (type) => {
    switch (type) {
      case 'accommodation': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'transport': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'activity': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'accommodation': return '🏨';
      case 'transport': return '✈️';
      case 'activity': return '🎯';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trip Planning</h1>
          <p className="text-gray-600 mt-1">
            {trip?.name} - {trip?.start_date} to {trip?.end_date}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Trip Event</DialogTitle>
              <DialogDescription>Add a new event to your trip timeline</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Visit Museum"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Add Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          {Object.keys(groupedByDate).length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500">No events planned yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, daySteps]) => (
                <div key={date} className="relative">
                  {/* Date Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {new Date(date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Items */}
                  <div className="space-y-3 relative ml-6 pl-6 border-l-2 border-gray-200">
                    {daySteps.map((step, idx) => (
                      <div key={step.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-8 top-2 border-4 border-white"></div>

                        {/* Card */}
                        <Card className={`border-2 ${getTypeColor(step.type || 'activity')}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl">{getTypeIcon(step.type)}</span>
                                  <h3 className="font-semibold text-lg">{step.title}</h3>
                                </div>
                                {step.description && (
                                  <p className="text-sm text-gray-700 mb-2">{step.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>Event {idx + 1} of {daySteps.length}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(step.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Events ({sortedSteps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedSteps.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No events planned yet</p>
                ) : (
                  sortedSteps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl mt-1">{getTypeIcon(step.type)}</span>
                        <div>
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-xs text-gray-600">{step.date}</p>
                          {step.description && (
                            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(step.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
