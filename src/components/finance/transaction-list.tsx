"use client"

import { useState } from "react";
import { Transaction, Category, Wallet } from "@/types";
import { 
  ArrowUpCircle, ArrowDownCircle, Filter,
  Wallet as WalletIcon, Banknote, CreditCard, Landmark, 
  ShoppingBag, Coffee, Utensils, Zap, 
  Home, Car, Plane, GraduationCap, 
  Heart, Dumbbell, Smartphone, Wifi, Gift,
  Briefcase, Music, Film, Gamepad2, Plus, ArrowRightLeft, SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditTransactionModal } from "./edit-transaction-modal";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
}

const ICONS = [
  { name: "wallet", component: WalletIcon },
  { name: "banknote", component: Banknote },
  { name: "card", component: CreditCard },
  { name: "bank", component: Landmark },
  { name: "shopping", component: ShoppingBag },
  { name: "food", component: Utensils },
  { name: "coffee", component: Coffee },
  { name: "bills", component: Zap },
  { name: "home", component: Home },
  { name: "car", component: Car },
  { name: "travel", component: Plane },
  { name: "education", component: GraduationCap },
  { name: "health", component: Heart },
  { name: "fitness", component: Dumbbell },
  { name: "phone", component: Smartphone },
  { name: "internet", component: Wifi },
  { name: "gift", component: Gift },
  { name: "work", component: Briefcase },
  { name: "entertainment", component: Gamepad2 },
  { name: "music", component: Music },
];

type FilterType = "all" | "income" | "expense" | "transfer";

export function TransactionList({ transactions, categories, wallets }: TransactionListProps) {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter
  const filtered = transactions.filter(t => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  // Group by Date
  const grouped = filtered.reduce((acc, t) => {
    const dateStr = t.date.split("T")[0]; // YYYY-MM-DD
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  function formatDateHeader(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  const getIconComponent = (name?: string) => {
    return ICONS.find(i => i.name === name)?.component || null; 
  };

  return (
    <>
      <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-lg">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          
          {/* Filters */}
          <div className="flex bg-secondary/50 p-1 rounded-xl self-start sm:self-auto">
            <button 
              onClick={() => setFilterType("all")}
              className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", filterType === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              All
            </button>
            <button 
               onClick={() => setFilterType("income")}
               className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", filterType === "income" ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground")}
            >
              In
            </button>
            <button 
               onClick={() => setFilterType("expense")}
               className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", filterType === "expense" ? "bg-background shadow-sm text-rose-600" : "text-muted-foreground")}
            >
              Out
            </button>
            <button 
               onClick={() => setFilterType("transfer")}
               className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", filterType === "transfer" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground")}
            >
              Transfer
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {sortedDates.length === 0 ? (
             <p className="text-muted-foreground text-center py-8">No transactions found.</p>
          ) : (
             sortedDates.map(date => (
                <div key={date}>
                   <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-2 border-l-2 border-primary/50">
                      {formatDateHeader(date)}
                   </h4>
                   <div className="space-y-3">
                      {grouped[date].map(t => {
                          const category = categories.find(c => c.id === t.categoryId);
                          const isIncome = t.type === "income";
                          const isTransfer = t.type === "transfer";
                          const isAdjustment = t.note === "Manual Balance Adjustment";
                          const targetWallet = isTransfer ? wallets.find(w => w.id === t.targetWalletId) : null;
                          const IconComponent = getIconComponent(category?.icon);
                          
                          return (
                              <div 
                                key={t.id} 
                                onClick={() => setSelectedTransaction(t)}
                                className="flex items-center justify-between p-4 mb-2 rounded-2xl hover:bg-white/60 dark:hover:bg-stone-700/50 hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-white/40 dark:hover:border-white/5"
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={cn(
                                          "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs transition-transform group-hover:scale-110",
                                          category?.color 
                                            ? "" 
                                            : (isIncome 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : (isTransfer 
                                                    ? 'bg-blue-100 text-blue-600' 
                                                    : (isAdjustment 
                                                        ? 'bg-amber-100 text-amber-600' // Adjustment Color
                                                        : 'bg-rose-100 text-rose-600')
                                                  )
                                              )
                                      )}
                                      style={{ backgroundColor: (isTransfer || isAdjustment) ? undefined : category?.color }}
                                      >
                                         {isTransfer ? (
                                           <ArrowRightLeft size={20} />
                                         ) : isAdjustment ? (
                                           <SlidersHorizontal size={20} />
                                         ) : (
                                            IconComponent ? (
                                              <IconComponent size={20} />
                                            ) : (
                                              isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />
                                            )
                                         )}
                                      </div>
                                      <div>
                                          <p className="font-medium text-foreground">
                                            {isTransfer && targetWallet 
                                              ? `Transfer to ${targetWallet.name}` 
                                              : (isAdjustment ? "Balance Adjusted" : (category?.name || "Unknown"))
                                            }
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {t.note}
                                          </p>
                                      </div>
                                  </div>
                                  <div className={`text-lg font-black tracking-tight drop-shadow-sm ${
                                      isIncome 
                                        ? 'text-emerald-500' 
                                        : (isTransfer 
                                            ? 'text-blue-500' 
                                            : (isAdjustment ? 'text-amber-500' : 'text-rose-500')
                                          )
                                    }`}>
                                      {isIncome ? '+' : (isTransfer || isAdjustment ? '' : '-')}฿{t.amount.toLocaleString()}
                                  </div>
                              </div>
                          )
                      })}
                   </div>
                </div>
             ))
          )}
        </div>
      </div>

      {selectedTransaction && (
        <EditTransactionModal 
          transaction={selectedTransaction}
          wallets={wallets}
          categories={categories}
          isOpen={true}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  );
}
