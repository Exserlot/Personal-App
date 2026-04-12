"use client"

import { useState } from "react";
import { WalletType } from "@/types";
import { addWallet } from "@/lib/actions/finance";
import { Loader2, Plus, X, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const WALLET_TYPES: WalletType[] = ["cash", "bank", "credit", "investment", "other"];

interface WalletManagerProps {
  trigger?: React.ReactNode;
}

export function WalletManager({ trigger }: WalletManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("bank");
  const [balance, setBalance] = useState("0");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await addWallet({
      name,
      type,
      balance: parseFloat(balance) || 0,
      color: "#000000" // Default
    });
    setLoading(false);
    setIsOpen(false);
    setName("");
    setBalance("0");
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || (
          <button className="items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 transition-opacity flex sm:hidden">
            <Plus size={16} />
            Add Wallet
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-3xl p-8 shadow-2xl ring-1 ring-black/5">
             <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <WalletIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">New Wallet</h3>
                  <p className="text-xs text-muted-foreground">Add a source of funds</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wallet Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="e.g. Main Bank Account"
                  required
                />
              </div>

               <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full rounded-xl border border-input bg-secondary/50 pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {WALLET_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all duration-200",
                         type === t
                           ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105" 
                           : "bg-background border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 mt-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Create Wallet
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
