import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Maximize2, Minimize2, X, Trash2, Image as ImageIcon, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function TripChat() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', tripId],
    queryFn: () => api.messages.list(tripId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => api.members.list(tripId),
  });

  const createMessageMutation = useMutation({
    mutationFn: (data) => api.messages.send(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
      setMessageText('');
      setImageFile(null);
      setImagePreview(null);
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
    if (!messageText.trim() && !imageFile) return;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (messageText.trim()) formData.append('text', messageText);
      createMessageMutation.mutate(formData);
    } else {
      createMessageMutation.mutate({ text: messageText });
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Fichier trop volumineux", description: "L'image ne doit pas dépasser 10 Mo.", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
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

          <div className="border-t p-4 bg-card shrink-0">
            {renderInput()}
          </div>
        </Card>
      )}

      {/* Lightbox for Chat Images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex flex-col"
            onClick={() => setLightboxImage(null)}
          >
            <div className="flex justify-end p-4 text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(lightboxImage, 'chat-photo.jpg');
                  }}
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setLightboxImage(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={lightboxImage} 
                alt="Enlarged chat view" 
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm flex flex-col gap-2",
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-white border text-secondary-foreground rounded-tl-none'
                  )}>
                    {msg.image_url && (
                      <div className="relative group/img -mx-2 -mt-1 mb-1">
                        <img 
                          src={`${BACKEND_URL}${msg.image_url}`} 
                          alt="Attachment" 
                          className="max-w-[200px] sm:max-w-[250px] max-h-[300px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxImage(`${BACKEND_URL}${msg.image_url}`)}
                          loading="lazy"
                        />
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute bottom-2 right-2 w-8 h-8 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/50 text-white hover:bg-black/70"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(`${BACKEND_URL}${msg.image_url}`, `chat-img-${msg.id}.jpg`);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {/* Long message wrapping with max height + scroll */}
                    {(msg.content || msg.text) && (
                      <p className="whitespace-pre-wrap break-words max-w-[calc(60vw)] sm:max-w-xs max-h-48 overflow-y-auto leading-relaxed">
                        {msg.content || msg.text}
                      </p>
                    )}
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
      <div className="flex flex-col gap-2">
        {imagePreview && (
          <div className="relative w-fit">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-md border shadow-sm" />
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/heic"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            type="text"
            placeholder="Écrivez votre message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={createMessageMutation.isPending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={(!messageText.trim() && !imageFile) || createMessageMutation.isPending} className="shrink-0 transition-transform active:scale-95">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    );
  }
}