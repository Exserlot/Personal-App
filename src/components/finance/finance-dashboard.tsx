"use client"

import { Wallet, Transaction, Category, TotalAssetsSummary, PaymentSlip } from "@/types";
import { WalletList } from "./wallet-list";
import { TransactionForm } from "./transaction-form";
import { AddTransactionModal } from "./add-transaction-modal";
import { TransactionList } from "./transaction-list";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet as WalletIcon,
  Plus
} from "lucide-react";
import { useState } from "react";

interface FinanceDashboardProps {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  summary: TotalAssetsSummary;
  slips: PaymentSlip[];
}

export function FinanceDashboard({
  wallets,
  transactions,
  categories,
  summary,
  slips: initialSlips
}: FinanceDashboardProps) {
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header & Total Assets (Omni-Wallet) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Assets Card - The Big One */}
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 dark:from-emerald-900/80 dark:via-teal-900/80 dark:to-cyan-900/80 text-teal-950 dark:text-teal-50 p-8 shadow-xl md:col-span-2 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 h-[200%] w-[200%] -mr-32 -mt-32 rounded-full bg-white/20 dark:bg-white/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="flex items-center gap-2 mb-3 opacity-80 backdrop-blur-sm bg-white/30 dark:bg-black/20 w-fit px-3 py-1.5 rounded-full text-sm font-semibold">
              <WalletIcon size={16} />
              <span>Total Assets (Net Worth)</span>
            </div>
            <div className="text-5xl lg:text-6xl font-black tracking-tight mt-2 drop-shadow-sm">
              ฿{summary.netWorth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-stone-800/50 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200/50 dark:bg-emerald-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0" />
           <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 bg-emerald-100/50 dark:bg-emerald-950/50 w-fit px-3 py-1.5 rounded-full">
              <ArrowUpCircle size={16} />
              <span>Income (This Month)</span>
            </div>
            <div className="text-3xl font-bold text-stone-800 dark:text-white">
              ฿{summary.totalIncome.toLocaleString()}
            </div>
           </div>
        </div>

        {/* Expense Card */}
        <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-stone-800/50 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
           <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-rose-200/50 dark:bg-rose-900/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 z-0" />
           <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400 mb-3 bg-rose-100/50 dark:bg-rose-950/50 w-fit px-3 py-1.5 rounded-full">
              <ArrowDownCircle size={16} />
              <span>Expense (This Month)</span>
            </div>
            <div className="text-3xl font-bold text-stone-800 dark:text-white">
              ฿{summary.totalExpense.toLocaleString()}
            </div>
           </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Wallets & Transactions List */}
        <div className="lg:col-span-2 space-y-8">
          <WalletList wallets={wallets} />

          <TransactionList
            transactions={transactions}
            categories={categories}
            wallets={wallets}
          />
        </div>

        {/* Right Column: Quick Add & Stats */}
        <div className="space-y-8">
          <div className="hidden lg:block">
            <TransactionForm wallets={wallets} categories={categories} />
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setShowAddTransactionModal(true)}
        className="fixed bottom-24 lg:bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <AddTransactionModal 
        wallets={wallets} 
        categories={categories} 
        isOpen={showAddTransactionModal} 
        onClose={() => setShowAddTransactionModal(false)} 
      />
    </div>
  );
}
