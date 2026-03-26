"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { WishlistItem, Wallet } from "@/types";
import { X, CheckCircle2, Wallet as WalletIcon, ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (walletId?: string) => Promise<void>;
  item: WishlistItem;
  wallets: Wallet[];
  defaultWalletId?: string;
}

export function ConfirmPurchaseModal({ isOpen, onClose, onConfirm, item, wallets, defaultWalletId }: ConfirmPurchaseModalProps) {
  const [createTransaction, setCreateTransaction] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    defaultWalletId || wallets[0]?.id || ""
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    setLoading(true);
    try {
      if (createTransaction && selectedWalletId) {
        await onConfirm(selectedWalletId);
      } else {
        await onConfirm(); // No transaction
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to confirm purchase.");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 size={24} />
             </div>
             <div>
               <h3 className="text-xl font-bold">Mark as Bought</h3>
               <p className="text-sm text-muted-foreground">Confirm your purchase</p>
             </div>
          </div>
          <button 
            disabled={loading}
            onClick={onClose} 
            className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item Summary */}
        <div className="mb-6 p-4 bg-secondary/30 rounded-xl border border-border/50 flex gap-4 items-center">
            {item.image ? (
                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-border bg-card">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
            ) : (
                <div className="h-14 w-14 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground/30 shrink-0">
                  <ShoppingBag size={24} />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <h4 className="font-bold line-clamp-1">{item.name}</h4>
                <div className="text-primary font-bold text-lg">฿{item.price.toLocaleString()}</div>
            </div>
        </div>

        {/* Form Options */}
        <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-colors bg-card">
              <div className="flex h-5 items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={createTransaction}
                    onChange={(e) => setCreateTransaction(e.target.checked)}
                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary/20 accent-primary"
                  />
              </div>
              <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Auto-Create Finance Transaction</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Automatically deduct this amount from one of your wallets and record it in Finance.</span>
              </div>
            </label>

            {createTransaction && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                   <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                       <WalletIcon size={14} /> Deduct From Wallet
                   </label>
                   {wallets.length > 0 ? (
                       <CustomSelect
                         value={selectedWalletId}
                         onChange={setSelectedWalletId}
                         options={wallets.map(w => ({
                           id: w.id,
                           label: w.name,
                           subLabel: `฿${w.balance.toLocaleString()}`
                         }))}
                         placeholder="Select Wallet"
                       />
                   ) : (
                       <div className="border border-border cursor-pointer hover:bg-secondary/50 transition-colors bg-card p-3 rounded-xl font-bold text-rose-500">
                           No wallets found. Please create one in Finance first.
                       </div>
                   )}
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-border font-bold hover:bg-secondary transition-colors text-muted-foreground"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={loading || (createTransaction && wallets.length === 0)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Confirm Purchase
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
