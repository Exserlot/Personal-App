"use client"

import { useState, useEffect } from "react";
import { Transaction, Wallet, Category, TransactionType, PaymentSlip } from "@/types";
import { updateTransaction, deleteTransaction, getSlip } from "@/lib/actions/finance";
import { Loader2, Trash2, Save, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface EditTransactionModalProps {
  transaction: Transaction;
  wallets: Wallet[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ 
  transaction, 
  wallets, 
  categories, 
  isOpen, 
  onClose 
}: EditTransactionModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const isAdjustment = transaction.note === "Manual Balance Adjustment";
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [note, setNote] = useState(transaction.note || "");
  const [walletId, setWalletId] = useState(transaction.walletId);
  const [targetWalletId, setTargetWalletId] = useState(transaction.targetWalletId || "");
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [date, setDate] = useState(transaction.date.split("T")[0]); // YYYY-MM-DD
  
  // Slip State
  const [slip, setSlip] = useState<PaymentSlip | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  useEffect(() => {
    if (transaction.slipId) {
      setLoadingSlip(true);
      getSlip(transaction.slipId)
        .then(setSlip)
        .catch(console.error)
        .finally(() => setLoadingSlip(false));
    }
  }, [transaction.slipId]);

  if (!isOpen) return null;

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTransaction({
        id: transaction.id,
        date: new Date(date).toISOString(),
        amount: parseFloat(amount),
        type,
        walletId,
        targetWalletId: type === "transfer" ? targetWalletId : undefined,
        categoryId,
        note,
        slipId: transaction.slipId, // Preserve slip link
        userId: transaction.userId
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm ? (
           <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                 <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Delete Transaction?</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-[240px]">
                This will permanently remove this record and revert the balance adjustment.
              </p>
              <div className="flex w-full gap-3">
                 <button 
                   onClick={() => setShowDeleteConfirm(false)}
                   className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-secondary transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   disabled={isDeleting}
                   className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                 >
                   {isDeleting && <Loader2 className="animate-spin" size={18} />}
                   Confirm Delete
                 </button>
              </div>
           </div>
        ) : null}

        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
          <h3 className="text-lg font-bold">Edit Transaction</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col flex-1 min-h-0">
           {/* Scrollable Body */}
           <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Date & Type Row */}
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Date</label>
                     <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-input bg-secondary/50 px-3 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={isAdjustment}
                     />
                 </div>
                  <div className="flex-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Type</label>
                      <div className="flex bg-secondary/50 p-1 rounded-xl">
                        {transaction.type !== "transfer" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setType("income")}
                              disabled={isAdjustment}
                              className={cn(
                                "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                                isAdjustment && "opacity-50 cursor-not-allowed",
                                type === "income" ? "bg-background text-emerald-600 shadow-sm" : "text-muted-foreground"
                              )}
                            >
                              In
                            </button>
                            <button
                              type="button"
                              onClick={() => setType("expense")}
                              disabled={isAdjustment}
                              className={cn(
                                "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                                isAdjustment && "opacity-50 cursor-not-allowed",
                                type === "expense" ? "bg-background text-rose-600 shadow-sm" : "text-muted-foreground"
                              )}
                            >
                              Out
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all opacity-50 cursor-not-allowed bg-background text-blue-600 shadow-sm"
                            )}
                          >
                            Transfer
                          </button>
                        )}
                      </div>
                  </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                   <input
                     type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-input bg-secondary/50 pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      step="0.01"
                      disabled={isAdjustment}
                    />
                </div>
              </div>

              {/* Wallet & Category */}
              <div className="space-y-4">
                 <div>
                   <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Wallet</label>
                   <CustomSelect
                     value={walletId}
                     onChange={setWalletId}
                      options={wallets.map(w => ({
                        id: w.id,
                        label: w.name,
                        subLabel: `Current: ฿${w.balance.toLocaleString()}`
                      }))}
                      disabled={isAdjustment}
                    />
                 </div>
                 
                 {type === "transfer" && (
                   <div>
                     <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">To Wallet</label>
                     <CustomSelect
                       value={targetWalletId}
                       onChange={setTargetWalletId}
                       options={wallets
                         .filter(w => w.id !== walletId)
                          .map(w => ({
                            id: w.id,
                            label: w.name,
                            subLabel: `Current: ฿${w.balance.toLocaleString()}`
                          }))}
                        disabled={isAdjustment}
                      />
                   </div>
                 )}
                 <div>
                   <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</label>
                   <CustomSelect
                     value={categoryId}
                     onChange={setCategoryId}
                     options={filteredCategories.map(c => ({
                       id: c.id,
                        label: c.name,
                        icon: <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                      }))}
                      disabled={isAdjustment}
                    />
                 </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</label>
                 <input
                   type="text"
                   value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Details..."
                    disabled={isAdjustment}
                  />
              </div>

              {/* Slip Preview */}
              {transaction.slipId && (
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attached Slip</label>
                    {loadingSlip ? (
                       <div className="h-32 w-full rounded-xl bg-secondary/50 flex items-center justify-center animate-pulse">
                          <Loader2 className="animate-spin text-muted-foreground" />
                       </div>
                    ) : slip ? (
                       <div className="relative group">
                          <img 
                             src={slip.imagePath} 
                             alt="Slip" 
                             className="w-full h-auto max-h-[200px] object-contain rounded-xl border border-border bg-secondary/20"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md flex items-center gap-1">
                             <ImageIcon size={12} />
                             Slip
                          </div>
                       </div>
                    ) : (
                       <div className="h-12 w-full rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                          Slip not found
                       </div>
                    )}
                 </div>
              )}
           </div>

           {/* Actions - Fixed Bottom */}
           {!showDeleteConfirm && (
             <div className="p-6 pt-4 border-t border-border/50 shrink-0 bg-background flex gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-3 text-rose-600 font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                
                {!isAdjustment && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] rounded-xl bg-primary py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                )}
              </div>
           )}
        </form>
      </div>
    </div>
  );
}
