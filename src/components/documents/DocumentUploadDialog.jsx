import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, Sparkles, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DocumentUploadDialog({ open, onOpenChange, tripId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedSteps, setExtractedSteps] = useState(null);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setExtractedSteps(null);
    setSaved(false);
  };

  const handleUploadAndExtract = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]); // Use file name as default title
      formData.append('type', file.type.includes('pdf') ? 'pdf' : 'image');

      const response = await api.documents.upload(tripId, formData);
      
      queryClient.invalidateQueries({ queryKey: ["documents", tripId] });
      setSaved(true);
      toast({ title: "Succès", description: "Document mis en ligne avec succès." });
      
      // Optionally handle extraction if backend supported it, but for now just close
      setTimeout(() => onOpenChange(false), 1500);
    } catch (err) {
      console.error('Upload error:', err);
      toast({ 
        variant: "destructive", 
        title: "Erreur d'upload", 
        description: err.message || "Impossible de mettre en ligne le fichier." 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) {
      setFile(null);
      setExtractedSteps(null);
      setSaved(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Import intelligent
          </DialogTitle>
          <DialogDescription>
            Uploadez un billet, une confirmation de réservation ou une facture. L'IA extraira automatiquement les informations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Fichier (PDF, image)</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors">
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="doc-upload"
              />
              <label htmlFor="doc-upload" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <FileText className="w-5 h-5 text-accent" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour sélectionner un fichier
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {extractedSteps && !saved && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {extractedSteps.length} étape(s) détectée(s) :
              </p>
              {extractedSteps.map((s, i) => (
                <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>•</span>
                  <span>{s.title}{s.date ? ` — ${s.date}` : ""}</span>
                </div>
              ))}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-green-600 justify-center py-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">Importé avec succès !</span>
            </div>
          )}

          <div className="flex gap-3">
            {!extractedSteps ? (
              <Button
                onClick={handleUploadAndExtract}
                disabled={!file || uploading || extracting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {(uploading || extracting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {uploading ? "Upload..." : extracting ? "Analyse IA..." : "Analyser le document"}
              </Button>
            ) : !saved ? (
              <Button
                onClick={handleSaveSteps}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Ajouter au planning
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}