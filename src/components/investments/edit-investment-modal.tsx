"use client";

import { useState } from "react";
import { InvestmentAsset, InvestmentType } from "@/types";
import { updateInvestment, deleteInvestment } from "@/lib/actions/investments";
import { X, Loader2, Save, TrendingUp, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomSelect } from "@/components/ui/custom-select";

interface EditInvestmentModalProps {
  investment: InvestmentAsset;
  isOpen: boolean;
  onClose: () => void;
}

const TYPES: { id: InvestmentType; label: string }[] = [
  { id: "stock", label: "Stock/ETF" },
  { id: "crypto", label: "Crypto" },
  { id: "fund", label: "Mutual Fund" },
  { id: "other", label: "Other" },
];

import { GlobalModal } from "@/components/ui/global-modal";

export function EditInvestmentModal({ investment, isOpen, onClose }: EditInvestmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState(investment.name);
  const [type, setType] = useState<InvestmentType>(investment.type);
  const [amountInvested, setAmountInvested] = useState(investment.amountInvested.toString());
  const [currentValue, setCurrentValue] = useState(investment.currentValue.toString());
  const [note, setNote] = useState(investment.note || "");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !amountInvested || !currentValue) return;
    
    setLoading(true);
    try {
      await updateInvestment(investment.id, {
        name,
        type,
        amountInvested: parseFloat(amountInvested),
        currentValue: parseFloat(currentValue),
        note,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteInvestment(investment.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <TrendingUp className="text-primary" size={20} />
          Edit Investment
        </>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Name / Symbol</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Type</label>
             <CustomSelect
               options={TYPES}
               value={type}
               onChange={(val) => setType(val as InvestmentType)}
             />
          </div>

          {/* Amount Invested & Current Value */}
          <div className="flex gap-4">
             <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Principal (Cost)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                  <input
                    type="number"
                    value={amountInvested}
                    onChange={(e) => setAmountInvested(e.target.value)}
                    className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                    step="0.01"
                  />
                </div>
             </div>
             <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Value</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">฿</span>
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full rounded-xl border border-input bg-emerald-50 pl-8 pr-4 py-3 text-lg font-bold text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    required
                    step="0.01"
                  />
                </div>
             </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note (Optional)</label>
             <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-20"
             />
          </div>

        </div>

        <div className="p-6 pt-4 border-t border-white/20 dark:border-white/5 shrink-0 bg-white/30 dark:bg-black/10 backdrop-blur-md flex gap-3">
           <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || loading}
            className="px-4 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center justify-center"
          >
            {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
          </button>
          <button
            type="submit"
            disabled={loading || deleting}
            className="flex-1 rounded-xl bg-primary py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Investment"
        message="Are you sure you want to delete this asset record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </GlobalModal>
  );
}
