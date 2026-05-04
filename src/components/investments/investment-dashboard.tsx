"use client";

import { useState } from "react";
import { InvestmentAsset } from "@/types";
import { AddInvestmentModal } from "./add-investment-modal";
import { EditInvestmentModal } from "./edit-investment-modal";
import { syncInvestmentPrices } from "@/lib/actions/investments";
import { Plus, TrendingUp, TrendingDown, Briefcase, Bitcoin, BarChart3, LineChart, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentDashboardProps {
  investments: InvestmentAsset[];
  userId: string;
  summary: {
    totalInvested: number;
    totalCurrentValue: number;
    profitLoss: number;
    profitLossPercentage: number;
  };
}

export function InvestmentDashboard({ investments, userId, summary }: InvestmentDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInv, setEditingInv] = useState<InvestmentAsset | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    const result = await syncInvestmentPrices();
    setSyncMessage(result.message);
    setSyncing(false);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const isPositive = summary.profitLoss >= 0;

  function getIconForType(type: string) {
    switch(type) {
      case "crypto": return <Bitcoin className="text-amber-500" />;
      case "stock": return <LineChart className="text-blue-500" />;
      case "fund": return <BarChart3 className="text-emerald-500" />;
      default: return <Briefcase className="text-stone-500" />;
    }
  }

  function getLabelForType(type: string) {
    switch(type) {
      case "crypto": return "Crypto";
      case "stock": return "Stock/ETF";
      case "fund": return "Mutual Fund";
      default: return "Other";
    }
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Investment Portfolio
          </h2>
          <p className="text-muted-foreground">Track your wealth building journey.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-stone-800/50 hover:bg-white/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-4 py-2 rounded-xl font-bold shadow-sm backdrop-blur-md transition-all border border-white/20 dark:border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Prices'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
          >
            <Plus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncMessage && (
        <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-emerald-100/80 dark:bg-emerald-900/40 backdrop-blur-xl px-5 py-3 shadow-lg text-sm font-medium text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300">
          {syncMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg">
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Principal</h3>
           <p className="text-3xl font-bold text-foreground">฿{summary.totalInvested.toLocaleString()}</p>
        </div>
        
        <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg">
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Value</h3>
           <p className="text-3xl font-bold text-foreground">฿{summary.totalCurrentValue.toLocaleString()}</p>
        </div>

        <div className={cn(
          "rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300",
          isPositive 
            ? "border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 dark:from-emerald-900/80 dark:via-teal-900/80 dark:to-cyan-900/80" 
            : "border border-rose-200/50 dark:border-rose-900/50 bg-gradient-to-br from-rose-200 via-orange-200 to-red-200 dark:from-rose-900/80 dark:via-orange-900/80 dark:to-red-900/80"
        )}>
           <div className="absolute top-0 right-0 h-[200%] w-[200%] -mr-32 -mt-32 rounded-full bg-white/20 dark:bg-white/5 blur-3xl pointer-events-none" />
           <div className="relative z-10">
             <h3 className={cn(
               "text-sm font-semibold uppercase tracking-wider mb-2 opacity-80",
               isPositive ? "text-teal-950 dark:text-teal-50" : "text-rose-950 dark:text-rose-50"
             )}>Total Return</h3>
             <div className="flex items-center gap-2">
               <p className={cn(
                 "text-3xl font-black drop-shadow-sm",
                 isPositive ? "text-teal-950 dark:text-teal-50" : "text-rose-950 dark:text-rose-50"
               )}>
                 {isPositive ? "+" : ""}฿{summary.profitLoss.toLocaleString()}
               </p>
               <div className={cn(
                 "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold shadow-sm backdrop-blur-sm",
                 isPositive ? "bg-white/30 dark:bg-black/20 text-teal-900 dark:text-teal-100" : "bg-white/30 dark:bg-black/20 text-rose-900 dark:text-rose-100"
               )}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {summary.profitLossPercentage.toFixed(2)}%
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="space-y-4">
         <h3 className="text-lg font-bold">Your Assets</h3>
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {investments.map(inv => {
             const profit = inv.currentValue - inv.amountInvested;
             const percentage = inv.amountInvested > 0 ? (profit / inv.amountInvested) * 100 : 0;
             const isInvPositive = profit >= 0;

             return (
               <div 
                 key={inv.id}
                 onClick={() => setEditingInv(inv)}
                 className="flex flex-col p-6 rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-white/60 dark:hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
               >
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                       {getIconForType(inv.type)}
                     </div>
                     <div>
                       <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{inv.name}</h4>
                       <p className="text-xs text-muted-foreground">{getLabelForType(inv.type)}</p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Principal</span>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">฿{inv.amountInvested.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground font-semibold">Value</span>
                      <span className="font-bold">฿{inv.currentValue.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Return
                    </span>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold",
                      isInvPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {isInvPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isInvPositive ? "+" : ""}฿{profit.toLocaleString()} ({percentage.toFixed(1)}%)
                    </div>
                 </div>
               </div>
             );
           })}
         </div>

         {investments.length === 0 && (
            <div 
              onClick={() => setShowAddModal(true)}
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/40 dark:border-white/10 rounded-3xl p-8 text-muted-foreground hover:border-white/80 dark:hover:border-white/30 bg-white/20 dark:bg-stone-800/20 backdrop-blur-xl hover:bg-white/40 dark:hover:bg-stone-800/40 hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer min-h-[200px] duration-300"
            >
               <Briefcase size={32} className="mb-2 opacity-30" />
               <span className="font-medium text-lg">No Assets</span>
               <span className="text-sm opacity-70">Start building your portfolio</span>
            </div>
         )}
      </div>

      {/* FAB for Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center sm:hidden hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <AddInvestmentModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        userId={userId}
      />

      {editingInv && (
        <EditInvestmentModal
          investment={editingInv}
          isOpen={true}
          onClose={() => setEditingInv(null)}
        />
      )}
    </div>
  );
}
