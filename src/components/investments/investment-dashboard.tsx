"use client";

import { useState } from "react";
import { InvestmentAsset } from "@/types";
import { AddInvestmentModal } from "./add-investment-modal";
import { EditInvestmentModal } from "./edit-investment-modal";
import { Plus, TrendingUp, TrendingDown, Briefcase, Bitcoin, BarChart3, LineChart } from "lucide-react";
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
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Principal</h3>
           <p className="text-3xl font-bold text-foreground">฿{summary.totalInvested.toLocaleString()}</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Value</h3>
           <p className="text-3xl font-bold text-foreground">฿{summary.totalCurrentValue.toLocaleString()}</p>
        </div>

        <div className={cn(
          "rounded-2xl p-6 shadow-sm",
          isPositive ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
        )}>
           <h3 className={cn(
             "text-sm font-semibold uppercase tracking-wider mb-2",
             isPositive ? "text-emerald-700" : "text-rose-700"
           )}>Total Return</h3>
           <div className="flex items-center gap-2">
             <p className={cn(
               "text-3xl font-bold",
               isPositive ? "text-emerald-600" : "text-rose-600"
             )}>
               {isPositive ? "+" : ""}฿{summary.profitLoss.toLocaleString()}
             </p>
             <div className={cn(
               "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold",
               isPositive ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
             )}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {summary.profitLossPercentage.toFixed(2)}%
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
                 className="flex flex-col p-5 rounded-2xl border border-border bg-card cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
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
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer min-h-[200px]"
            >
               <Briefcase size={32} className="mb-2 opacity-30" />
               <span className="font-medium">No Assets</span>
               <span className="text-xs">Start building your portfolio</span>
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
