import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock, CheckCircle2, BarChart3, X, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/LanguageContext';
import { format, isPast } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function PollSection({ tripId }) {
  const { t, lang } = useTranslation();
  const dateLocale = lang === 'fr' ? fr : enUS;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // New poll form state
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [deadline, setDeadline] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');

  // Fetch polls with auto-refresh every 10 seconds
  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['polls', tripId],
    queryFn: () => api.polls.list(tripId),
    refetchInterval: 10000, 
  });

  const createMutation = useMutation({
    mutationFn: (pollData) => api.polls.create(tripId, pollData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
      setIsOpen(false);
      setQuestion('');
      setDescription('');
      setOptions(['', '']);
      setDeadline('');
      setDeadlineTime('');
    }
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }) => api.polls.vote(tripId, pollId, optionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls', tripId] })
  });

  const unvoteMutation = useMutation({
    mutationFn: (pollId) => api.polls.unvote(tripId, pollId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls', tripId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (pollId) => api.polls.delete(tripId, pollId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls', tripId] })
  });

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index) => setOptions(options.filter((_, i) => i !== index));
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== '');
    if (!question.trim() || validOptions.length < 2) return;

    let deadlineIso = null;
    if (deadline) {
      deadlineIso = new Date(`${deadline}T${deadlineTime || '23:59'}`).toISOString();
    }

    createMutation.mutate({
      question,
      description,
      options: validOptions,
      deadline: deadlineIso
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('polls.title') || 'Sondages'}</h2>
          <p className="text-muted-foreground mt-1">{t('polls.subtitle') || 'Prenez des décisions ensemble'}</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
              <Plus className="w-4 h-4" />
              {t('polls.create') || 'Nouveau sondage'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{t('polls.create') || 'Nouveau sondage'}</DialogTitle>
              <DialogDescription>{t('polls.createDesc') || 'Posez une question aux membres du voyage.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePoll} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('polls.question') || 'Question'} *</Label>
                <Input 
                  placeholder={t('polls.questionPlaceholder') || 'Ex: Quelle destination pour le week-end ?'} 
                  value={question} 
                  onChange={e => setQuestion(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>{t('polls.description') || 'Description (optionnel)'}</Label>
                <Textarea 
                  placeholder={t('polls.descPlaceholder') || 'Plus de détails sur le choix...'} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={2}
                />
              </div>
              
              <div className="space-y-3">
                <Label>{t('polls.options') || 'Options'} *</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      placeholder={`${t('polls.option') || 'Option'} ${i + 1}`} 
                      value={opt} 
                      onChange={e => handleOptionChange(i, e.target.value)} 
                      required={i < 2}
                    />
                    {options.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => handleRemoveOption(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="w-full gap-2 border-dashed">
                  <Plus className="w-4 h-4" /> {t('polls.addOption') || 'Ajouter une option'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('polls.deadlineDate') || 'Date limite (optionnel)'}</Label>
                  <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('polls.deadlineTime') || 'Heure'}</Label>
                  <Input type="time" value={deadlineTime} onChange={e => setDeadlineTime(e.target.value)} disabled={!deadline} />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={createMutation.isPending || !question.trim() || options.filter(o => o.trim()).length < 2}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('polls.create') || 'Créer le sondage'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">{t('polls.emptyTitle') || 'Aucun sondage'}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">{t('polls.emptyDesc') || 'Créez un sondage pour demander l\'avis des autres membres du voyage.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map(poll => {
            const isExpired = poll.deadline ? isPast(new Date(poll.deadline)) : false;
            const totalVotes = poll.total_votes || 0;
            // Sort options by vote count if poll is expired
            const displayOptions = isExpired 
              ? [...poll.options].sort((a, b) => b.vote_count - a.vote_count)
              : poll.options;
            
            const winningOptionId = isExpired && totalVotes > 0 ? displayOptions[0].id : null;

            return (
              <Card key={poll.id} className={`border-border shadow-sm overflow-hidden transition-all ${isExpired ? 'bg-muted/30' : ''}`}>
                <CardHeader className="pb-3 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg leading-tight">{poll.question}</CardTitle>
                      <CardDescription className="mt-1">
                        {t('polls.createdBy') || 'Par'} {poll.creator_name} • {totalVotes} {t('polls.votesCount') || 'votes'}
                      </CardDescription>
                    </div>
                    {poll.created_by === user?.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 -mt-1 -mr-2" onClick={() => deleteMutation.mutate(poll.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {poll.description && <p className="text-sm mt-2 text-foreground/80">{poll.description}</p>}
                  
                  {poll.deadline && (
                    <Badge variant={isExpired ? "secondary" : "outline"} className="mt-3 flex w-fit items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {isExpired ? (t('polls.ended') || 'Terminé le') : (t('polls.ends') || 'Se termine le')} {format(new Date(poll.deadline), "d MMM yyyy à HH:mm", { locale: dateLocale })}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3 pt-0">
                  {displayOptions.map(option => {
                    const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                    const isVoted = poll.user_vote === option.id;
                    const isWinner = winningOptionId === option.id;
                    
                    return (
                      <div 
                        key={option.id} 
                        onClick={() => !isExpired && (isVoted ? unvoteMutation.mutate(poll.id) : voteMutation.mutate({ pollId: poll.id, optionId: option.id }))}
                        className={`
                          relative overflow-hidden rounded-lg border p-3 
                          ${!isExpired ? 'cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors' : ''}
                          ${isVoted ? 'border-primary ring-1 ring-primary/20' : 'border-border'}
                          ${isWinner ? 'bg-primary/5 border-primary/30' : 'bg-card'}
                        `}
                      >
                        {/* Progress Bar Background */}
                        <div 
                          className={`absolute inset-0 opacity-10 ${isWinner ? 'bg-primary' : 'bg-primary'}`} 
                          style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
                        />
                        
                        <div className="relative flex justify-between items-center z-10 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isVoted && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                            {isWinner && !isVoted && <span className="text-lg leading-none">🏆</span>}
                            <span className={`text-sm truncate ${isVoted || isWinner ? 'font-medium' : ''}`}>
                              {option.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-medium text-muted-foreground">{option.vote_count}</span>
                            <span className="text-xs font-bold w-9 text-right">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
