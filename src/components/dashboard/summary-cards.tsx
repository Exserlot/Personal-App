"use client";

import { Wallet, TrendingUp, TrendingDown, Repeat } from "lucide-react";

interface SummaryCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  activeSubscriptionsCount: number;
}

export function SummaryCards({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  activeSubscriptionsCount,
}: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH").format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Balance */}
      <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 dark:from-emerald-900/80 dark:via-teal-900/80 dark:to-cyan-900/80 text-teal-950 dark:text-teal-50 p-6 shadow-xl relative overflow-hidden backdrop-blur-xl group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 h-[200%] w-[200%] -mr-32 -mt-32 rounded-full bg-white/20 dark:bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div className="flex items-center gap-3 mb-3 opacity-80 backdrop-blur-sm bg-white/30 dark:bg-black/20 w-fit px-3 py-1.5 rounded-full text-sm font-semibold">
            <Wallet size={16} />
            <span>Net Worth</span>
          </div>
          <p className="text-4xl font-black tracking-tight drop-shadow-sm mt-1">
            <span className="text-xl mr-1">฿</span>{formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200/50 dark:bg-emerald-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 bg-emerald-100/50 dark:bg-emerald-950/50 w-fit px-3 py-1.5 rounded-full text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
            <TrendingUp size={16} />
            <span>Monthly Income</span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-stone-800 dark:text-white drop-shadow-sm mt-1">
            <span className="text-lg mr-1 opacity-70">฿</span>{formatCurrency(monthlyIncome)}
          </p>
        </div>
      </div>

      {/* Monthly Expense */}
      <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-rose-200/50 dark:bg-rose-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 bg-rose-100/50 dark:bg-rose-950/50 w-fit px-3 py-1.5 rounded-full text-rose-700 dark:text-rose-400 font-semibold text-sm">
            <TrendingDown size={16} />
            <span>Monthly Expense</span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-stone-800 dark:text-white drop-shadow-sm mt-1">
            <span className="text-lg mr-1 opacity-70">฿</span>{formatCurrency(monthlyExpense)}
          </p>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-200/50 dark:bg-purple-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 bg-purple-100/50 dark:bg-purple-950/50 w-fit px-3 py-1.5 rounded-full text-purple-700 dark:text-purple-400 font-semibold text-sm">
            <Repeat size={16} />
            <span>Active Subscriptions</span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-stone-800 dark:text-white drop-shadow-sm mt-1">
            {activeSubscriptionsCount}
            <span className="text-sm font-semibold opacity-70 ml-2">Bills</span>
          </p>
        </div>
      </div>
    </div>
  );
}
