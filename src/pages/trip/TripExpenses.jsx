import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
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
import { Plus, Trash2, Loader2, Receipt, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const categoryLabels = {
  accommodation: "🏨 Hébergement",
  transport: "🚗 Transport",
  food: "🍽️ Repas",
  activity: "🎯 Activité",
  shopping: "🛍️ Shopping",
  other: "📦 Autre",
};

export default function TripExpenses() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "food",
    date: "",
    paid_by: user?.email || "",
  });

  const { data: trip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => api.expenses.list(tripId),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => api.activities.list(tripId),
  });

  const { data: transports = [] } = useQuery({
    queryKey: ["transports", tripId],
    queryFn: () => api.transports.list(tripId),
  });

  const { data: accommodations = [] } = useQuery({
    queryKey: ["accommodations", tripId],
    queryFn: () => api.accommodations.list(tripId),
  });

  const allExpenses = useMemo(() => {
    const actExp = activities
      .filter((a) => a.price > 0)
      .map((a) => ({
        id: `act_${a.id}`,
        title: `Activité : ${a.name}`,
        amount: Number(a.price),
        category: "activity",
        date: a.date,
        paid_by: "Système (Automatique)",
        split_between: [],
        isActivity: true
      }));
    const transExp = transports
      .filter((t) => t.price > 0)
      .map((t) => ({
        id: `trans_${t.id}`,
        title: `Transport : ${t.type} vers ${t.arrival}`,
        amount: Number(t.price),
        category: "transport",
        date: t.departureTime || new Date().toISOString(),
        paid_by: "Système (Automatique)",
        split_between: [],
        isActivity: true
      }));

    const accExp = accommodations
      .filter((a) => a.price > 0)
      .map((a) => ({
        id: `acc_${a.id}`,
        title: `Hébergement : ${a.name}`,
        amount: Number(a.price),
        category: "accommodation",
        date: a.checkIn || new Date().toISOString(),
        paid_by: "Système (Automatique)",
        split_between: [],
        isActivity: true
      }));

    return [...expenses, ...actExp, ...transExp, ...accExp].sort((a, b) => {
      const db = new Date(b.date || 0);
      const da = new Date(a.date || 0);
      return db - da;
    });
  }, [expenses, activities, transports, accommodations]);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.expenses.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses", tripId] }),
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const members = [user?.email, ...(trip?.members || [])].filter(Boolean);
      await api.expenses.create(tripId, {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        paid_by: form.paid_by,
        split_between: members,
      });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      setShowAdd(false);
      setForm({ title: "", amount: "", category: "food", date: "", paid_by: user?.email || "" });
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setSaving(false);
    }
  };

  const total = useMemo(
    () => allExpenses.reduce((s, e) => s + (e.amount || 0), 0),
    [allExpenses]
  );

  // Balances
  const balances = useMemo(() => {
    const members = new Set();
    allExpenses.forEach((e) => {
      if (!e.isActivity) members.add(e.paid_by);
      e.split_between?.forEach((m) => members.add(m));
    });
    const bal = {};
    members.forEach((m) => (bal[m] = 0));
    allExpenses.forEach((e) => {
      if (e.isActivity) {
        const tripMembers = [user?.email, ...(trip?.members || [])].filter(Boolean);
        const splitCount = tripMembers.length || 1;
        const perPerson = e.amount / splitCount;
        tripMembers.forEach((m) => {
          bal[m] = (bal[m] || 0) - perPerson;
        });
      } else {
        const splitCount = e.split_between?.length || 1;
        const perPerson = e.amount / splitCount;
        bal[e.paid_by] = (bal[e.paid_by] || 0) + e.amount - perPerson;
        e.split_between?.forEach((m) => {
          if (m !== e.paid_by) {
            bal[m] = (bal[m] || 0) - perPerson;
          }
        });
      }
    });
    return bal;
  }, [allExpenses, trip, user]);

  const tripMembers = useMemo(() => {
    const m = [user?.email];
    if (trip?.members) {
      if (typeof trip.members[0] === "string") {
        m.push(...trip.members);
      } else {
        m.push(...trip.members.map(x => x.email || x));
      }
    }
    return [...new Set(m)].filter(Boolean);
  }, [trip, user]);

  const settlements = useMemo(() => {
    const debtors = [];
    const creditors = [];
    
    Object.entries(balances).forEach(([email, amount]) => {
      if (amount > 0.01) creditors.push({ email, amount });
      else if (amount < -0.01) debtors.push({ email, amount: Math.abs(amount) });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const results = [];
    let d = 0, c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      
      const settled = Math.min(debtor.amount, creditor.amount);
      
      results.push({
        from: debtor.email,
        to: creditor.email,
        amount: settled
      });
      
      debtor.amount -= settled;
      creditor.amount -= settled;
      
      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }
    
    return results;
  }, [balances]);


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Dépenses</h2>
        <div className="flex items-center gap-2">
          {Object.keys(balances).length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowBalance(true)}
            >
              Équilibre
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total dépenses</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total.toFixed(2)}€</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Nombre</p>
          <p className="text-2xl font-bold text-foreground mt-1">{allExpenses.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Budget restant</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {trip?.budget ? `${(trip.budget - total).toFixed(2)}€` : "—"}
          </p>
        </div>
      </div>


      {/* Expense list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : allExpenses.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucune dépense enregistrée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allExpenses.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between bg-card border border-border rounded-xl p-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{categoryLabels[exp.category]?.split(" ")[0] || "📦"}</span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.paid_by}{exp.date && ` · ${format(new Date(exp.date), "d MMM", { locale: fr })}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-foreground">{exp.amount?.toFixed(2)}€</span>
                {!exp.isActivity && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMutation.mutate(exp.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Nouvelle dépense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                placeholder="Ex: Dîner au restaurant"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Montant *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Payé par</Label>
                <Select value={form.paid_by} onValueChange={(v) => setForm((f) => ({ ...f, paid_by: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez un membre" /></SelectTrigger>
                  <SelectContent>
                    {tripMembers.map((email) => (
                      <SelectItem key={email} value={email}>{email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter la dépense
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Balance Modal */}
      <Dialog open={showBalance} onOpenChange={setShowBalance}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Équilibre des comptes</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {settlements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tous les comptes sont à l'équilibre !</p>
            ) : (
              <div className="space-y-3">
                {settlements.map((s, i) => (
                  <div key={i} className="flex flex-col p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{s.from}</span>
                        <span className="text-xs text-muted-foreground">doit rembourser à {s.to}</span>
                      </div>
                      <span className="font-bold text-base text-foreground">{s.amount.toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {Object.keys(balances).length > 0 && (
              <div className="pt-4 border-t border-border mt-4">
                <h4 className="text-sm font-semibold mb-2 text-foreground">Synthèse des soldes purs</h4>
                <div className="space-y-1.5">
                  {Object.entries(balances)
                    .filter(([_, bal]) => Math.abs(bal) > 0.01)
                    .map(([email, bal]) => (
                    <div key={email} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{email}</span>
                      <span className={bal >= 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                        {bal > 0 ? "+" : ""}{bal.toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}