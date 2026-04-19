import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Maximize2, Minimize2, X, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function TripChat() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
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

  const createMessageMutation = useMutation({
    mutationFn: (text) => api.messages.send(tripId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
      setMessageText('');
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (msgId) => api.messages.delete(tripId, msgId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', tripId] }),
    onError: () => toast({ title: "Erreur", description: "Impossible de supprimer le message", variant: "destructive" }),
  });

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isFullScreen]);

  const [viewportHeight, setViewportHeight] = useState('100%');
  useEffect(() => {
    if (!isFullScreen) return;
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        window.scrollTo(0, 0);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    handleResize();
    document.body.style.overflow = 'hidden';
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) createMessageMutation.mutate(messageText);
  };

  const getMember = (userId) => members.find(m => m.user_id === userId) || members.find(m => m.id === userId);
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
      const d = new Date(typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr);
      if (isNaN(d)) return '';
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Chat Collectif</h1>
        <p className="text-muted-foreground mt-1">Communiquez avec les membres du voyage ({members.length || 1} membres)</p>
      </div>

      {isFullScreen ? createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden" style={{ height: viewportHeight }}>
          <div className="border-b bg-white py-3 px-4 flex flex-row items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Discussion</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-slate-100/50" onClick={() => setIsFullScreen(false)}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 overscroll-contain">
            {renderMessages()}
          </div>
          <div className="border-t p-4 pb-10 bg-white shadow-lg shrink-0">
            {renderInput()}
          </div>
        </div>,
        document.body
      ) : (
        <Card className="flex flex-col border border-border shadow-md h-[600px] rounded-xl overflow-hidden">
          <CardHeader className="border-b bg-muted/20 py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5 text-primary" />
              Discussion
            </CardTitle>
            {/* Enlarged clickable area for fullscreen button */}
            <button
              onClick={() => setIsFullScreen(true)}
              className="h-11 w-11 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Plein écran"
            >
              <Maximize2 className="w-5 h-5 text-primary" />
            </button>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {renderMessages()}
          </div>

          <div className="border-t p-4 bg-card">
            {renderInput()}
          </div>
        </Card>
      )}
    </div>
  );

  function renderMessages() {
    if (messages.length === 0) {
      return (
        <div className="text-center py-20 text-muted-foreground">
          <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 opacity-20" />
          </div>
          <p>Aucun message pour le moment. Lancez la conversation !</p>
        </div>
      );
    }

    return (
      <>
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar className="w-9 h-9 shrink-0 border border-border self-end">
                <AvatarImage src={getMemberAvatar(msg.user_id)} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 text-[10px] px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-bold text-foreground/80">{getMemberName(msg.user_id)}</span>
                  <span className="text-muted-foreground/60">{formatTime(msg.created_at || msg.created_date)}</span>
                </div>

                <div className="flex items-end gap-1.5">
                  {/* Delete button — only visible on own messages, on hover */}
                  {isOwn && (
                    <button
                      onClick={() => deleteMessageMutation.mutate(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-white border text-secondary-foreground rounded-tl-none'
                  )}>
                    {/* Long message wrapping with max height + scroll */}
                    <p className="whitespace-pre-wrap break-words max-w-[calc(60vw)] sm:max-w-xs max-h-48 overflow-y-auto leading-relaxed">
                      {msg.content || msg.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </>
    );
  }

  function renderInput() {
    return (
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder="Écrivez votre message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={createMessageMutation.isPending}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!messageText.trim() || createMessageMutation.isPending} className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    );
  }
}