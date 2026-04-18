import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Maximize2, Minimize2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function TripChat() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', tripId],
    queryFn: () => api.messages.list(tripId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => api.members.list(tripId),
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const createMessageMutation = useMutation({
    mutationFn: (text) => api.messages.send(tripId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
      setMessageText('');
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      createMessageMutation.mutate(messageText);
    }
  };

  const getMember = (userId) => {
    return members.find(m => m.user_id === userId) || members.find(m => m.id === userId);
  };

  const getMemberName = (userId) => {
    if (userId === user?.id) return 'Vous';
    const member = getMember(userId);
    return member?.name || `Membre ${String(userId).slice(0, 4)}`;
  };

  const getMemberAvatar = (userId) => {
    const member = getMember(userId);
    return member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const normalizedDateStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
      const date = new Date(normalizedDateStr);
      if (isNaN(date)) return '';
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Chat Collectif</h1>
        <p className="text-muted-foreground mt-1">Communiquez avec les membres du voyage ({members.length || 1} membres)</p>
      </div>

      <Card className={cn(
        "flex flex-col border border-border shadow-md transition-all duration-300 overflow-hidden",
        isFullScreen ? "fixed inset-0 z-[100] rounded-none h-[100dvh] w-full" : "h-[600px] rounded-xl"
      )}>
        <CardHeader className="border-b bg-white py-3 px-4 flex flex-row items-center justify-between space-y-0 shadow-sm z-10">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle className="w-5 h-5 text-primary" />
            {isFullScreen ? (trip?.name || 'Discussion') : 'Discussion'}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            {isFullScreen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsFullScreen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 opacity-20" />
              </div>
              <p>Aucun message pour le moment. Lancez la conversation !</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-9 h-9 shrink-0 border border-border">
                    <AvatarImage src={getMemberAvatar(msg.user_id)} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col gap-1 max-w-[75%] ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 text-[10px] px-1 ${msg.user_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="font-bold text-foreground/80">{getMemberName(msg.user_id)}</span>
                      <span className="text-muted-foreground/60">{formatTime(msg.created_at || msg.created_date)}</span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.user_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-white border text-secondary-foreground rounded-tl-none'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className={cn("border-t p-4 bg-white shadow-sm", isFullScreen ? "pb-8" : "bg-card")}>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Écrivez votre message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={createMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!messageText.trim() || createMessageMutation.isPending}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
