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

import { GlobalModal } from "@/components/ui/global-modal";
import { SaveButton } from "@/components/ui/save-button";
import { PREMIUM_INPUT_CLASS, PREMIUM_TEXTAREA_CLASS } from "@/lib/constants/styles";

export function AddSubscriptionModal({
  isOpen,
  onClose,
  userId,
}: AddSubscriptionModalProps) {
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
        nextBillingDate: nextBillingDate
          ? new Date(nextBillingDate).toISOString()
          : undefined,
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
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <RefreshCw className="text-primary" size={20} />
          Add Subscription
        </>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(PREMIUM_INPUT_CLASS)}
              placeholder="e.g. Netflix, Spotify"
              required
              autoFocus
            />
          </div>

          {/* Price & Cycle */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  ฿
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={cn(PREMIUM_INPUT_CLASS, "pl-10 py-3 text-lg font-bold")}
                  required
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cycle
              </label>
              <div className="flex bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner p-1 rounded-xl h-[54px] items-center">
                {CYCLES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCycle(c.value)}
                    className={cn(
                      "flex-1 h-full rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                      cycle === c.value
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground",
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
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Next Billing Date (Optional)
            </label>
            <input
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className={cn(PREMIUM_INPUT_CLASS, "py-3")}
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
              className={cn(PREMIUM_INPUT_CLASS, "py-2.5")}
              placeholder="https://..."
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={cn(PREMIUM_TEXTAREA_CLASS, "h-16")}
              placeholder="Any details..."
            />
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-white/20 dark:border-white/5 shrink-0">
          <SaveButton
            label="Add Subscription"
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </GlobalModal>
  );
}
