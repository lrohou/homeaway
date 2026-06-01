import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, Trash2, Download, Image as ImageIcon, X, Expand, Archive, FileArchive, Images, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/LanguageContext';
import { downloadAllPhotos, downloadZipStandard, downloadZipInteractive } from '@/utils/albumDownloader';

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

  // ─── Download State ────────────────────────────────────────────
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, message: '' });
  const [downloadResult, setDownloadResult] = useState(null); // { success, failed, error }
  const downloadMenuRef = useRef(null);

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
      window.open(url, '_blank');
    }
  };

  // ─── Album Download Handlers ───────────────────────────────────

  const onProgress = useCallback((current, total, message) => {
    setDownloadProgress({ current, total, message });
  }, []);

  const handleAlbumDownload = async (type) => {
    setShowDownloadMenu(false);
    setDownloading(true);
    setDownloadResult(null);
    setDownloadProgress({ current: 0, total: photos.length, message: 'Préparation...' });

    try {
      let result;
      const albumName = `HomeAway-Album-${tripId}`;

      switch (type) {
        case 'zip':
          result = await downloadZipStandard(photos, BACKEND_URL, albumName, onProgress);
          break;
        case 'html':
          result = await downloadZipInteractive(photos, BACKEND_URL, albumName, onProgress);
          break;
        case 'all':
          result = await downloadAllPhotos(photos, BACKEND_URL, onProgress);
          break;
        default:
          throw new Error('Type de téléchargement inconnu');
      }

      setDownloadResult(result);
    } catch (err) {
      console.error('Album download failed:', err);
      setDownloadResult({ success: 0, failed: 0, error: err.message || 'Le téléchargement a échoué. Veuillez réessayer.' });
    } finally {
      setDownloading(false);
    }
  };

  // Fermer le menu de téléchargement quand on clique ailleurs
  React.useEffect(() => {
    if (!showDownloadMenu) return;
    const handler = (e) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDownloadMenu]);

  // Fermer le résultat automatiquement après 6 secondes
  React.useEffect(() => {
    if (!downloadResult) return;
    const timer = setTimeout(() => setDownloadResult(null), 6000);
    return () => clearTimeout(timer);
  }, [downloadResult]);

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

  const progressPercent = downloadProgress.total > 0 
    ? Math.round((downloadProgress.current / downloadProgress.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('photos.title') || 'Galerie Photos'}</h2>
          <p className="text-muted-foreground mt-1">{t('photos.subtitle') || 'Partagez vos souvenirs de voyage'}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* ─── Download Album Button ─── */}
          <div className="relative" ref={downloadMenuRef}>
            <Button
              variant="outline"
              className={`gap-2 shadow-sm transition-all duration-200 ${photos.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40'}`}
              disabled={photos.length === 0 || downloading}
              onClick={() => setShowDownloadMenu((prev) => !prev)}
              title={photos.length === 0 ? 'Aucune photo dans l\'album' : 'Télécharger l\'album'}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Télécharger l'album</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>

            {/* ─── Dropdown Menu ─── */}
            <AnimatePresence>
              {showDownloadMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-border bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {photos.length} photo{photos.length > 1 ? 's' : ''} dans l'album
                    </p>
                  </div>

                  <div className="p-1.5">
                    {/* Option 1: ZIP Standard */}
                    <button
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      onClick={() => handleAlbumDownload('zip')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                        <Archive className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Archive ZIP</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Fichier ZIP avec toutes les photos compressées</p>
                      </div>
                    </button>

                    {/* Option 2: Album HTML Interactif */}
                    <button
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      onClick={() => handleAlbumDownload('html')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                        <FileArchive className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Album Web Interactif</p>
                        <p className="text-xs text-muted-foreground mt-0.5">ZIP + galerie HTML avec slider tactile et mode sombre</p>
                      </div>
                    </button>

                    {/* Option 3: Tout télécharger */}
                    <button
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      onClick={() => handleAlbumDownload('all')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                        <Images className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tout télécharger</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Télécharge chaque image individuellement sur votre appareil</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Upload Button ─── */}
          <Button 
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
            onClick={() => setShowAdd(true)}
          >
            <Upload className="w-4 h-4" />
            {t('photos.upload') || 'Ajouter des photos'}
          </Button>
        </div>
      </div>

      {/* ─── Progress Bar (Downloading) ─── */}
      <AnimatePresence>
        {downloading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">{downloadProgress.message}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Download Result Toast ─── */}
      <AnimatePresence>
        {downloadResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              downloadResult.error 
                ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                : downloadResult.failed > 0 
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {downloadResult.error ? (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            ) : downloadResult.failed > 0 ? (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-medium">
              {downloadResult.error 
                ? downloadResult.error
                : downloadResult.failed > 0
                  ? `Album généré ! ${downloadResult.success} photo${downloadResult.success > 1 ? 's' : ''} incluse${downloadResult.success > 1 ? 's' : ''}, ${downloadResult.failed} image${downloadResult.failed > 1 ? 's' : ''} n'ont pas pu être incluse${downloadResult.failed > 1 ? 's' : ''}.`
                  : `Album téléchargé avec succès ! ${downloadResult.success} photo${downloadResult.success > 1 ? 's' : ''}.`
              }
            </p>
            <button 
              className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setDownloadResult(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Photo Grid ─── */}
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
