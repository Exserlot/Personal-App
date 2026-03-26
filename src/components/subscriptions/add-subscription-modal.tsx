"use client";

import { useState } from "react";
import { BillingCycle } from "@/types";
import { addSubscription } from "@/lib/actions/subscriptions";
import { X, Loader2, Save, Link as LinkIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function AddSubscriptionModal({ isOpen, onClose, userId }: AddSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    
    setLoading(true);
    try {
      await addSubscription({
        name,
        price: parseFloat(price),
        cycle,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate).toISOString() : undefined,
        url,
        note,
      });
      onClose();
      // Reset form
      setName("");
      setPrice("");
      setCycle("monthly");
      setNextBillingDate("");
      setUrl("");
      setNote("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <RefreshCw className="text-primary" size={20} />
            Add Subscription
          </h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="e.g. Netflix, Spotify"
                required
                autoFocus
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
                      className="w-full rounded-xl border border-input bg-secondary/50 pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                      step="0.01"
                      placeholder="0.00"
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
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Billing Date (Optional)</label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <LinkIcon size={12} /> Management Link (Optional)
               </label>
               <input
                 type="url"
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                 placeholder="https://..."
               />
            </div>

            {/* Note */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</label>
               <textarea
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-16"
                 placeholder="Any details..."
               />
            </div>

          </div>

          <div className="p-6 pt-4 border-t border-border/50 shrink-0 bg-background">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Add Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
