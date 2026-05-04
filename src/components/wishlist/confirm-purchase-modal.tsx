"use client";

import { useState } from "react";
import { WishlistItem, Wallet } from "@/types";
import { CheckCircle2, Wallet as WalletIcon, ShoppingBag } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { GlobalModal } from "@/components/ui/global-modal";
import { SaveButton } from "@/components/ui/save-button";
import { CancelButton } from "@/components/ui/cancel-button";

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (walletId?: string) => Promise<void>;
  item: WishlistItem;
  wallets: Wallet[];
  defaultWalletId?: string;
}

export function ConfirmPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  wallets,
  defaultWalletId,
}: ConfirmPurchaseModalProps) {
  const [createTransaction, setCreateTransaction] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    defaultWalletId || wallets[0]?.id || "",
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
          <CheckCircle2 className="text-emerald-500" size={20} />
          Mark as Bought
        </>
      }
      maxWidth="md"
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Item Summary */}
          <div className="p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/10 flex gap-4 items-center shadow-inner">
            {item.image ? (
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/40 dark:border-white/10 bg-white/50 dark:bg-stone-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-white/50 dark:bg-stone-800 border border-white/40 dark:border-white/10 flex items-center justify-center text-muted-foreground/30 shrink-0">
                <ShoppingBag size={28} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-lg line-clamp-1">{item.name}</h4>
              <div className="text-primary font-bold text-xl">
                ฿{item.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Form Options */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-white/40 dark:border-white/10 cursor-pointer hover:bg-white/60 dark:hover:bg-black/30 transition-all bg-white/30 dark:bg-black/10 shadow-sm group">
              <div className="flex h-5 items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={createTransaction}
                  onChange={(e) => setCreateTransaction(e.target.checked)}
                  className="h-5 w-5 rounded border-white/40 dark:border-white/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Auto-Create Transaction
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Automatically deduct this amount from one of your wallets and
                  record it in Finance.
                </span>
              </div>
            </label>

            {createTransaction && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pl-1">
                  <WalletIcon size={14} /> Deduct From Wallet
                </label>
                {wallets.length > 0 ? (
                  <CustomSelect
                    value={selectedWalletId}
                    onChange={setSelectedWalletId}
                    options={wallets.map((w) => ({
                      id: w.id,
                      label: w.name,
                      subLabel: `Balance: ฿${w.balance.toLocaleString()}`,
                    }))}
                  />
                ) : (
                  <div className="border border-rose-200/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl font-bold text-rose-500 text-sm">
                    No wallets found. Please create one in Finance first.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-white/20 dark:border-white/5 shrink-0 flex gap-3">
          <CancelButton onClick={onClose} className="flex-1" />
          <SaveButton
            label="Confirm Purchase"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading || (createTransaction && wallets.length === 0)}
            className="flex-1"
            icon={<CheckCircle2 size={18} />}
          />
        </div>
      </div>
    </GlobalModal>
  );
}
