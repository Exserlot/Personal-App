"use client";

import { useState } from "react";
import { Wallet } from "@/types";
import { Wallet as WalletIcon, TrendingUp, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WalletWidgetProps {
  wallets: Wallet[];
}

export function WalletWidget({ wallets }: WalletWidgetProps) {
  const [showAllDialog, setShowAllDialog] = useState(false);
  
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const displayWallets = wallets.slice(0, 4);
  const hasMore = wallets.length > 4;

  return (
    <>
      <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <WalletIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Total Balance</h3>
              <p className="text-xs text-muted-foreground">All Accounts</p>
            </div>
          </div>
          <Link 
            href="/finance"
            className="text-sm text-primary hover:underline font-medium"
          >
            View Finance →
          </Link>
        </div>

        {/* Total Balance */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">฿{totalBalance.toLocaleString()}</span>
            <TrendingUp className="text-emerald-500" size={24} />
          </div>
        </div>

        {/* Wallet List */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {displayWallets.map(wallet => (
            <div key={wallet.id} className="flex items-center gap-3 p-4 mb-2 rounded-2xl bg-white/50 dark:bg-stone-700/30 hover:bg-white/80 dark:hover:bg-stone-700/60 hover:shadow-md transition-all border border-transparent hover:border-white/50">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: wallet.color || '#6366f1' }}>
                {wallet.icon ? (
                  <img src={wallet.icon} alt={wallet.name} className="h-6 w-6" />
                ) : (
                  <WalletIcon size={18} className="text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{wallet.name}</p>
                <p className="text-xs text-muted-foreground">฿{wallet.balance.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {hasMore && (
          <button
            onClick={() => setShowAllDialog(true)}
            className="w-full py-2.5 rounded-xl border border-border bg-background hover:bg-secondary/50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View All ({wallets.length} Wallets)
          </button>
        )}
      </div>

      {/* View All Dialog */}
      {showAllDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => setShowAllDialog(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
              <h3 className="text-xl font-bold">All Wallets</h3>
              <button onClick={() => setShowAllDialog(false)} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {wallets.map(wallet => (
                  <div key={wallet.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: wallet.color || '#6366f1' }}>
                      {wallet.icon ? (
                        <img src={wallet.icon} alt={wallet.name} className="h-7 w-7" />
                      ) : (
                        <WalletIcon size={20} className="text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{wallet.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{wallet.type}</p>
                      <p className="text-lg font-bold text-primary mt-1">฿{wallet.balance.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
