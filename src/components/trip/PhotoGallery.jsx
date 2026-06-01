import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, Trash2, Download, Image as ImageIcon, X, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/LanguageContext';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function PhotoGallery({ tripId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showAdd, setShowAdd] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const fileInputRef = useRef(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos', tripId],
    queryFn: () => api.photos.list(tripId),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => api.photos.upload(tripId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', tripId] });
      setShowAdd(false);
      setFile(null);
      setCaption('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.photos.delete(tripId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', tripId] });
      if (lightboxIndex !== null && photos.length <= 1) {
        setLightboxIndex(null);
      } else if (lightboxIndex !== null && lightboxIndex >= photos.length - 1) {
        setLightboxIndex(Math.max(0, photos.length - 2));
      }
    }
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (caption) formData.append('caption', caption);
      await uploadMutation.mutateAsync(formData);
    } finally {
      setSaving(false);
    }
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
      console.error('Download failed', error);
      // Fallback
      window.open(url, '_blank');
    }
  };

  const nextPhoto = (e) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('photos.title') || 'Galerie Photos'}</h2>
          <p className="text-muted-foreground mt-1">{t('photos.subtitle') || 'Partagez vos souvenirs de voyage'}</p>
        </div>
        
        <Button 
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
          onClick={() => setShowAdd(true)}
        >
          <Upload className="w-4 h-4" />
          {t('photos.upload') || 'Ajouter des photos'}
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">{t('photos.emptyTitle') || 'Aucune photo'}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">{t('photos.emptyDesc') || 'Commencez à ajouter des photos pour créer votre album de souvenirs.'}</p>
          <Button variant="outline" onClick={() => setShowAdd(true)}>{t('photos.upload') || 'Ajouter des photos'}</Button>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group overflow-hidden rounded-xl bg-muted cursor-pointer break-inside-avoid"
              onClick={() => setLightboxIndex(i)}
            >
              <img 
                src={photo.file_url.startsWith('http') ? photo.file_url : `${BACKEND_URL}${photo.file_url}`}
                alt={photo.caption || 'Photo'} 
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo.file_url.startsWith('http') ? photo.file_url : `${BACKEND_URL}${photo.file_url}`, `photo-${photo.id}.jpg`);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {(photo.uploaded_by === user?.id || user?.role === 'owner') && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="w-8 h-8 rounded-full opacity-80 hover:opacity-100 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(photo.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  {photo.caption && <p className="text-white text-sm font-medium drop-shadow-md truncate">{photo.caption}</p>}
                  <p className="text-white/80 text-xs drop-shadow-md">{photo.uploader_name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t('photos.upload') || 'Ajouter une photo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 pt-4">
            <div className="space-y-2">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-accent/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/heic"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-lg bg-muted mx-auto overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium truncate max-w-full px-4">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{t('photos.dragDrop') || 'Cliquez pour sélectionner une image'}</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WEBP (max. 10MB)</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('photos.caption') || 'Légende (optionnel)'}</Label>
              <Input
                placeholder={t('photos.captionPlaceholder') || 'Un petit mot sur cette photo...'}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              disabled={!file || saving}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('photos.uploadBtn') || 'Uploader'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col"
            onClick={() => setLightboxIndex(null)}
          >
            <div className="flex justify-between items-center p-4 text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex flex-col">
                <span className="font-medium text-lg">{photos[lightboxIndex].caption}</span>
                <span className="text-sm text-white/70">{t('photos.by') || 'Par'} {photos[lightboxIndex].uploader_name}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(photos[lightboxIndex].file_url.startsWith('http') ? photos[lightboxIndex].file_url : `${BACKEND_URL}${photos[lightboxIndex].file_url}`, `photo-${photos[lightboxIndex].id}.jpg`);
                  }}
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setLightboxIndex(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
              <motion.img 
                key={lightboxIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={photos[lightboxIndex].file_url.startsWith('http') ? photos[lightboxIndex].file_url : `${BACKEND_URL}${photos[lightboxIndex].file_url}`}
                alt="Enlarged view" 
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              />
              
              {/* Navigation arrows */}
              {lightboxIndex > 0 && (
                <button 
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  onClick={prevPhoto}
                >
                  <span className="sr-only">Précédent</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              
              {lightboxIndex < photos.length - 1 && (
                <button 
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  onClick={nextPhoto}
                >
                  <span className="sr-only">Suivant</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )}
            </div>
            
            <div className="p-4 text-center text-white/50 text-sm">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
