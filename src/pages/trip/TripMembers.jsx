import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Trash2, Clock, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/lib/LanguageContext';

export default function TripMembers() {
  const { tripId } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => api.members.list(tripId),
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['invitations', tripId],
    queryFn: () => api.members.listInvitations(tripId),
  });

  const inviteMutation = useMutation({
    mutationFn: (email) => api.members.invite(tripId, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', tripId] });
      setInviteEmail('');
      setSuccessMessage(`Invitation envoyée à ${inviteEmail}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsOpen(false);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => api.members.remove(tripId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', tripId] })
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (invId) => api.members.cancelInvitation(tripId, invId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations', tripId] })
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteMutation.mutate(inviteEmail);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('members.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('members.subtitle')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md transition-all active:scale-95">
              <UserPlus className="w-4 h-4" />
              {t('members.invite')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{t('members.inviteTitle')}</DialogTitle>
              <DialogDescription>{t('members.inviteDesc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">{t('members.emailLabel')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="ami@exemple.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={inviteMutation.isPending || !inviteEmail.trim()}
                    className="bg-primary text-primary-foreground"
                  >
                    {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('members.send')}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <Mail className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Members */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">{t('members.participants')} ({members.length})</CardTitle>
            <CardDescription>{t('members.activeMembers')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border border-border shadow-sm">
                      <AvatarImage src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`} />
                      <AvatarFallback className="bg-primary/10 text-primary">{member.name?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm">{member.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{member.email}</span>
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="text-[10px] h-4 py-0 leading-none">
                          {member.role === 'owner' ? t('members.owner') : t('members.traveler')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeMemberMutation.mutate(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {membersLoading && (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
              )}
              {members.length === 0 && !membersLoading && (
                <div className="p-8 text-center text-muted-foreground">{t('members.noMembers')}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-amber-50/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900"><Clock className="w-5 h-5" /> {t('members.invitations')} ({invitations.length})</CardTitle>
            <CardDescription>{t('members.pendingResponse')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-amber-50/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{inv.email}</p>
                      <p className="text-xs text-amber-600 font-medium">{t('members.pendingInvite')}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => cancelInvitationMutation.mutate(inv.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {invitationsLoading && (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
              )}
              {invitations.length === 0 && !invitationsLoading && (
                <div className="p-12 text-center text-muted-foreground">
                  <p className="text-sm">{t('members.noPending')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
