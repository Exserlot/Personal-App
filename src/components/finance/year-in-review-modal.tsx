"use client";

import { useEffect, useState } from "react";
import { Transaction, Category, PaymentSlip } from "@/types";
import {
  X,
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Receipt,
  CalendarHeart,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface YearInReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  slips: PaymentSlip[];
  year?: number;
}

export function YearInReviewModal({
  isOpen,
  onClose,
  transactions,
  categories,
  slips,
  year = new Date().getFullYear(),
}: YearInReviewModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter data for the selected year
  const yearTxs = transactions.filter(
    (t) => new Date(t.date).getFullYear() === year,
  );
  const yearSlips = slips.filter(
    (s) => new Date(s.uploadDate).getFullYear() === year,
  );

  // Calculate metrics
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};
  let biggestExpense: Transaction | null = null;

  yearTxs.forEach((t) => {
    if (t.type === "income") totalIncome += t.amount;
    else if (t.type === "expense") {
      totalExpense += t.amount;
      categoryTotals[t.categoryId] =
        (categoryTotals[t.categoryId] || 0) + t.amount;

      if (!biggestExpense || t.amount > biggestExpense.amount) {
        biggestExpense = t;
      }
    }
  });

  // Find top category
  let topCategoryId = "";
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([catId, amount]) => {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategoryId = catId;
    }
  });
  const topCategory = categories.find((c) => c.id === topCategoryId);

  // Top 3 Categories for Pie Chart
  const top3Data = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat?.name || "Unknown",
        value,
        color: cat?.color || "#94a3b8",
      };
    });

  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-100/80 via-purple-50/80 to-sky-100/80 dark:from-rose-950/30 dark:via-purple-900/20 dark:to-sky-950/30 backdrop-blur-3xl text-white shadow-2xl animate-in fade-in zoom-in duration-300 text-white shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Background Effects */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-indigo-500/30 blur-[100px]" />

        <div className="relative flex flex-col items-center justify-center p-8 min-h-[500px]">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <X size={20} />
          </button>

          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-white/10 p-4 backdrop-blur-md">
              <CalendarHeart size={40} className="text-purple-300" />
            </div>
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
              {year} Wrapped
            </h2>
            <p className="mt-2 text-sm text-purple-200/70 font-medium">
              A summary of your finances this year
            </p>
          </div>

          <div className="w-full space-y-4">
            {/* Slide 1: Cashflow Overview */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp size={20} />
                  <span className="font-semibold text-sm">Total Income</span>
                </div>
                <span className="text-xl font-bold">
                  ฿{totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <TrendingDown size={20} />
                  <span className="font-semibold text-sm">Total Expense</span>
                </div>
                <span className="text-xl font-bold">
                  ฿{totalExpense.toLocaleString()}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">
                    Net Savings
                  </span>
                  <span
                    className={`text-xl font-black ${netSavings >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    ฿{netSavings.toLocaleString()}
                  </span>
                </div>
                {netSavings > 0 && (
                  <p className="text-xs text-emerald-400/80 mt-1 text-right">
                    Saved {savingsRate}% of income! 🎉
                  </p>
                )}
              </div>
            </div>

            {/* Slide 2: Top Category */}
            {topCategory && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 mb-1">
                    <Trophy size={18} />
                    <span className="font-semibold text-sm">
                      Top Expense Category
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {topCategory.name}
                  </p>
                  <p className="text-sm text-white/60">
                    ฿{topCategoryAmount.toLocaleString()}
                  </p>
                </div>
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner text-2xl font-bold"
                  style={{ backgroundColor: topCategory.color }}
                >
                  {topCategory.name.charAt(0)}
                </div>
              </div>
            )}

            {/* Slide 3: Fun Facts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center">
                <Receipt className="mx-auto mb-2 text-blue-300" size={24} />
                <p className="text-2xl font-black text-white">
                  {yearSlips.length}
                </p>
                <p className="text-xs text-white/60">Slips Uploaded</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center">
                <Star className="mx-auto mb-2 text-amber-300" size={24} />
                <p className="text-2xl font-black text-white">
                  {yearTxs.length}
                </p>
                <p className="text-xs text-white/60">Total Transactions</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full rounded-full bg-white text-indigo-900 py-3 font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
