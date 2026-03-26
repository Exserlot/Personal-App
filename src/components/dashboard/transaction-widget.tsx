"use client";

import { Transaction, Category, Wallet } from "@/types";
import { Receipt, ArrowUpCircle, ArrowDownCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

interface TransactionWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
}

export function TransactionWidget({ transactions, categories, wallets }: TransactionWidgetProps) {
  // Filter for today
  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter(t => t.date.startsWith(today));

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
  const getWalletName = (id: string) => wallets.find(w => w.id === id)?.name || "Unknown";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Receipt size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Today's Transactions</h3>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        <Link 
          href="/finance"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Transaction List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {todayTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No transactions today</p>
          </div>
        ) : (
          todayTransactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 
                tx.type === 'expense' ? 'bg-rose-100 text-rose-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                {tx.type === 'income' ? <ArrowUpCircle size={20} /> : 
                 tx.type === 'expense' ? <ArrowDownCircle size={20} /> :
                 <TrendingUp size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{getCategoryName(tx.categoryId)}</p>
                <p className="text-xs text-muted-foreground truncate">{tx.note || getWalletName(tx.walletId)}</p>
              </div>
              <div className={`text-sm font-bold ${
                tx.type === 'income' ? 'text-emerald-600' : 
                tx.type === 'expense' ? 'text-rose-600' : 
                'text-blue-600'
              }`}>
                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}฿{tx.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
