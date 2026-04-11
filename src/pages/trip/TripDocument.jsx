import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Upload, Plus, ExternalLink, Trash2, Loader2, Ticket, CreditCard, Shield, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const typeConfig = {
  ticket: { label: "Billet", icon: Ticket, color: "bg-blue-500/10 text-blue-600" },
  reservation: { label: "Réservation", icon: FileCheck, color: "bg-emerald-500/10 text-emerald-600" },
  passport: { label: "Passeport", icon: Shield, color: "bg-purple-500/10 text-purple-600" },
  invoice: { label: "Facture", icon: CreditCard, color: "bg-orange-500/10 text-orange-600" },
  insurance: { label: "Assurance", icon: Shield, color: "bg-teal-500/10 text-teal-600" },
  other: { label: "Autre", icon: FileText, color: "bg-gray-500/10 text-gray-600" },
};

export default function TripDocuments() {
  const { tripId } = useParams();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "other" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', tripId],
    queryFn: () => api.documents.list(tripId),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => api.documents.upload(tripId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
      setShowAdd(false);
      setForm({ title: "", type: "other" });
      setFile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.documents.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', tripId] }),
  });

  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!file || !form.title) {
      alert('Veuillez sélectionner un fichier et entrer un titre');
      return;
    }
    setSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('title', form.title);
      formDataObj.append('type', form.type);

      await uploadMutation.mutateAsync(formDataObj);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Documents</h2>
        <Button
          size="sm"
          className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun document pour ce voyage</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, i) => {
            const config = typeConfig[doc.type] || typeConfig.other;
            const Icon = config.icon;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`${BACKEND_URL}${doc.file_url}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate(doc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h4 className="font-medium text-foreground text-sm truncate">{doc.title}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className={`text-xs ${config.color}`}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(doc.created_date), "d MMM yyyy", { locale: fr })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Ajouter un document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Fichier *</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="hidden"
                  id="doc-add"
                />
                <label htmlFor="doc-add" className="cursor-pointer">
                  {file ? (
                    <span className="text-sm font-medium">{file.name}</span>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Cliquez pour sélectionner</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                placeholder="Nom du document"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={!file || saving}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}