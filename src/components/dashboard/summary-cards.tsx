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
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 text-primary rounded-xl">
            <Wallet size={20} />
          </div>
          <h3 className="font-medium text-muted-foreground text-sm">Net Worth</h3>
        </div>
        <p className="text-3xl font-bold tracking-tight text-primary">
          <span className="text-xl mr-1">฿</span>{formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Monthly Income */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <h3 className="font-medium text-muted-foreground text-sm">Monthly Income</h3>
        </div>
        <p className="text-2xl font-bold tracking-tight">
          <span className="text-lg mr-1 text-muted-foreground">฿</span>{formatCurrency(monthlyIncome)}
        </p>
      </div>

      {/* Monthly Expense */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
            <TrendingDown size={20} />
          </div>
          <h3 className="font-medium text-muted-foreground text-sm">Monthly Expense</h3>
        </div>
        <p className="text-2xl font-bold tracking-tight">
          <span className="text-lg mr-1 text-muted-foreground">฿</span>{formatCurrency(monthlyExpense)}
        </p>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
            <Repeat size={20} />
          </div>
          <h3 className="font-medium text-muted-foreground text-sm">Active Subscriptions</h3>
        </div>
        <p className="text-2xl font-bold tracking-tight">
          {activeSubscriptionsCount}
          <span className="text-sm font-normal text-muted-foreground ml-2">Bills</span>
        </p>
      </div>
    </div>
  );
}
