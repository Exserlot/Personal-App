"use client";

import { useState } from "react";
import { Subscription, BillingCycle } from "@/types";
import { updateSubscription, deleteSubscription } from "@/lib/actions/subscriptions";
import { X, Loader2, Save, Link as LinkIcon, RefreshCw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface EditSubscriptionModalProps {
  subscription: Subscription;
  isOpen: boolean;
  onClose: () => void;
}

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

import { GlobalModal } from "@/components/ui/global-modal";

export function EditSubscriptionModal({ subscription, isOpen, onClose }: EditSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState(subscription.name);
  const [price, setPrice] = useState(subscription.price.toString());
  const [cycle, setCycle] = useState<BillingCycle>(subscription.cycle);
  
  // Convert ISO state back to YYYY-MM-DD for input if exists
  const initialDate = subscription.nextBillingDate ? subscription.nextBillingDate.split("T")[0] : "";
  const [nextBillingDate, setNextBillingDate] = useState(initialDate);
  
  const [url, setUrl] = useState(subscription.url || "");
  const [note, setNote] = useState(subscription.note || "");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    
    setLoading(true);
    try {
      await updateSubscription(subscription.id, {
        name,
        price: parseFloat(price),
        cycle,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate).toISOString() : undefined,
        url,
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
      await deleteSubscription(subscription.id);
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
          <RefreshCw className="text-primary" size={20} />
          Edit Subscription
        </>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              required
            />
          </div>

          {/* Price & Cycle */}
          <div className="flex gap-4">
             <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                    step="0.01"
                  />
                </div>
             </div>
             <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cycle</label>
                <div className="flex bg-secondary/50 p-1 rounded-xl h-[54px] items-center">
                  {CYCLES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCycle(c.value)}
                      className={cn(
                        "flex-1 h-full rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                        cycle === c.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                       {c.label}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Next Billing Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Billing Date</label>
            <input
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <LinkIcon size={12} /> Management Link
             </label>
             <input
               type="url"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
             />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</label>
             <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-16"
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
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </GlobalModal>
  );
}
