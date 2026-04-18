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
import { Plus, Trash2, Loader2, Receipt, ArrowUpRight, ArrowDownLeft, Scale } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";

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
  const { t, lang } = useTranslation();
  const dateLocale = lang === 'fr' ? fr : enUS;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().split('T')[0],
    paid_by: user?.id || "",
  });

  const { data: trip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trips.get(tripId),
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["members", tripId],
    queryFn: () => api.members.list(tripId),
  });

  const tripMembers = useMemo(() => {
    if (members.length > 0) return members;
    // Fallback to current user if members haven't loaded
    return [{ user_id: user?.id, email: user?.email, name: user?.name }];
  }, [members, user]);

  const memberMap = useMemo(() => {
    const map = {};
    tripMembers.forEach(m => {
      map[m.user_id] = m;
      map[m.email] = m; // Support both for transition
    });
    return map;
  }, [tripMembers]);

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
    const actExp = (activities || [])
      .filter((a) => a.price > 0)
      .map((a) => ({
        id: `act_${a.id}`,
        title: `${t('cat.activity')} : ${a.name}`,
        amount: Number(a.price),
        category: "activity",
        date: a.date,
        paid_by: a.paid_by,
        split_between: [],
        isActivity: true
      }));
    const transExp = (transports || [])
      .filter((tr) => tr.price > 0)
      .map((tr) => ({
        id: `trans_${tr.id}`,
        title: `${t('cat.transport')} : ${t(`cat.${tr.type}`) || tr.type} → ${tr.arrival}`,
        amount: Number(tr.price),
        category: "transport",
        date: tr.departureTime || new Date().toISOString(),
        paid_by: tr.paid_by,
        split_between: [],
        isActivity: true
      }));

    const accExp = (accommodations || [])
      .filter((a) => a.price > 0)
      .map((a) => ({
        id: `acc_${a.id}`,
        title: `${t('cat.hotel')} : ${a.name}`,
        amount: Number(a.price),
        category: "accommodation",
        date: a.checkIn || new Date().toISOString(),
        paid_by: a.paid_by,
        split_between: [],
        isActivity: true
      }));

    return [...(expenses || []), ...actExp, ...transExp, ...accExp].sort((a, b) => {
      const db = new Date(b.date || 0);
      const da = new Date(a.date || 0);
      return db - da;
    });
  }, [expenses, activities, transports, accommodations, t]);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.expenses.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses", tripId] }),
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.expenses.create(tripId, {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        paid_by: Number(form.paid_by),
        split_between: tripMembers.map(m => m.email),
      });
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      setShowAdd(false);
      setForm({ title: "", amount: "", category: "food", date: new Date().toISOString().split('T')[0], paid_by: user?.id || "" });
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
    const bal = {};
    tripMembers.forEach((m) => (bal[m.email] = 0));
    
    allExpenses.forEach((e) => {
      const payerEmail = e.payer_email || memberMap[e.paid_by]?.email || (typeof e.paid_by === 'string' ? e.paid_by : null);
      
      if (!payerEmail) return; // Skip items with no valid payer

      if (e.isActivity) {
        // For reservations (hotels, transports, activities), split equal among ALL members
        const splitCount = tripMembers.length || 1;
        const perPerson = e.amount / splitCount;
        
        // Credit the payer
        bal[payerEmail] = (bal[payerEmail] || 0) + e.amount - perPerson;

        // Debit everyone else
        tripMembers.forEach((m) => {
          if (m.email !== payerEmail) {
            bal[m.email] = (bal[m.email] || 0) - perPerson;
          }
        });
      } else {
        // For standard expenses, use split_between list
        const splitCount = e.split_between?.length || 1;
        const perPerson = e.amount / splitCount;
        
        // Credit the payer
        bal[payerEmail] = (bal[payerEmail] || 0) + e.amount - perPerson;
        
        // Debit the people in split_between
        e.split_between?.forEach((mEmail) => {
          if (mEmail !== payerEmail) {
            bal[mEmail] = (bal[mEmail] || 0) - perPerson;
          }
        });
      }
    });
    return bal;
  }, [allExpenses, tripMembers, memberMap]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold">{t('expenses.title')}</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {tripMembers.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full w-full sm:w-auto h-11 sm:h-9"
              onClick={() => setShowBalance(true)}
            >
              <Scale className="w-5 h-5 sm:w-4 sm:h-4" />
              {t('expenses.balance')}
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full w-full sm:w-auto h-11 sm:h-9 shadow-md"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
            {t('expenses.add')}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('expenses.total')}</p>
          <p className="text-3xl font-display font-bold text-foreground">{total.toFixed(2)}€</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('expenses.count')}</p>
          <p className="text-3xl font-display font-bold text-foreground">{allExpenses.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('expenses.budgetLeft')}</p>
          <p className="text-3xl font-display font-bold text-foreground">
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
        <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-slate-100">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t('expenses.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allExpenses.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <span className="text-xl">{categoryLabels[exp.category]?.split(" ")[0] || "📦"}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-base truncate">{exp.title}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t('expenses.paidBy')} {exp.payer_name || exp.payer_email || exp.paid_by || "—"}{exp.date && ` · ${format(new Date(exp.date), "d MMM yyyy", { locale: dateLocale })}`}
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
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t('expenses.newExpense')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>{t('expenses.description')} *</Label>
              <Input
                placeholder="Ex: Dîner au restaurant"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('expenses.amount')} *</Label>
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
                <Label>{t('expenses.category')}</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{t(`expenses.${k}`) || v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('expenses.date')}</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('expenses.paidBy')}</Label>
                <Select value={String(form.paid_by)} onValueChange={(v) => setForm((f) => ({ ...f, paid_by: v }))}>
                  <SelectTrigger><SelectValue placeholder="Membre" /></SelectTrigger>
                  <SelectContent>
                    {tripMembers.map((m) => (
                      <SelectItem key={m.user_id || m.email} value={String(m.user_id || m.email)}>{m.name || m.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('expenses.addExpense')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showBalance} onOpenChange={setShowBalance}>
        <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/30 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="font-display text-2xl text-white">{t('expenses.balanceTitle')}</DialogTitle>
              <p className="text-blue-100/80 text-sm mt-1 mb-2">{t('expenses.balanceDesc')}</p>
            </DialogHeader>
          </div>
          
          <div className="p-6 sm:p-8 bg-slate-50 min-h-[300px]">
            {settlements.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-full">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Scale className="w-8 h-8" />
                </div>
                <p className="font-display font-semibold text-lg text-slate-800">{t('expenses.noReimbursements')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">{t('expenses.reimbursements')}</h4>
                {settlements.map((s, i) => (
                  <div key={i} className="flex relative items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 truncate">{s.from}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <span>{t('expenses.owes')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-slate-700 truncate">{s.to}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-display font-bold text-lg text-rose-600 bg-rose-50 px-3 py-1 rounded-full">{s.amount.toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {Object.keys(balances).length > 0 && settlements.length > 0 && (
              <div className="pt-6 mt-6 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">{t('expenses.summary') || 'Synthèse'}</h4>
                <div className="space-y-2">
                  {Object.entries(balances)
                    .filter(([_, bal]) => Math.abs(bal) > 0.01)
                    .sort((a, b) => b[1] - a[1])
                    .map(([email, bal]) => (
                    <div key={email} className="flex justify-between items-center bg-white border border-slate-100 p-2.5 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 truncate mr-2">{email}</span>
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${bal > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
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