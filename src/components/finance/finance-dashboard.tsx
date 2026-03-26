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
        <div className="rounded-xl border border-border bg-stone-900 text-stone-50 p-6 shadow-md md:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-stone-800/50 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-stone-300">
              <WalletIcon size={18} />
              <span className="text-sm font-medium">Total Assets (Net Worth)</span>
            </div>
            <div className="text-4xl font-bold tracking-tight">
              ฿{summary.netWorth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowUpCircle className="text-emerald-500" size={18} />
            <span>Income (This Month)</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            ฿{summary.totalIncome.toLocaleString()}
          </div>
        </div>

        {/* Expense Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowDownCircle className="text-rose-500" size={18} />
            <span>Expense (This Month)</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            ฿{summary.totalExpense.toLocaleString()}
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
