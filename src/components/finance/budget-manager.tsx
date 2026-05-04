"use client";

import { useState } from "react";
import { Category, Budget, Transaction } from "@/types";
import { SetBudgetModal } from "./set-budget-modal";
import { setBudget, deleteBudget } from "@/lib/actions/finance";
import {
  Plus,
  Target,
  Trash2,
  Edit2,
  AlertCircle,
  Wallet as WalletIcon,
  Banknote,
  CreditCard,
  Landmark,
  ShoppingBag,
  Coffee,
  Utensils,
  Zap,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Dumbbell,
  Smartphone,
  Wifi,
  Gift,
  Briefcase,
  Music,
  Film,
  Gamepad2,
} from "lucide-react";

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

const getIconComponent = (name?: string) => {
  return ICONS.find((i) => i.name === name)?.component || null;
};

interface BudgetManagerProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  month: number;
  year: number;
}

export function BudgetManager({
  categories,
  budgets,
  transactions,
  month,
  year,
}: BudgetManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  // Calculate spent per category this month
  const categorySpent: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      const tDate = new Date(t.date);
      if (tDate.getMonth() + 1 === month && tDate.getFullYear() === year) {
        categorySpent[t.categoryId] =
          (categorySpent[t.categoryId] || 0) + t.amount;
      }
    }
  });

  const handleSaveBudget = async (categoryId: string, amount: number) => {
    await setBudget(categoryId, amount, month, year);
  };

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id);
  };

  return (
    <>
      <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold">Monthly Budgets</h3>
          </div>
          <button
            onClick={() => {
              setEditingCategoryId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm font-bold rounded-full shadow-sm backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 dark:border-white/10"
          >
            <Plus size={16} /> Set Budget
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-white/40 dark:border-white/10 bg-white/20 dark:bg-stone-800/20 backdrop-blur-sm p-8 text-center">
            <Target
              className="mx-auto mb-3 text-stone-400 dark:text-stone-600"
              size={40}
            />
            <p className="text-stone-600 dark:text-stone-400 font-medium">
              No budgets set for this month.
            </p>
            <p className="text-sm text-stone-500 mt-1">
              Set limits to control your spending.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget) => {
              const category = categories.find(
                (c) => c.id === budget.categoryId,
              );
              if (!category) return null;

              const spent = categorySpent[budget.categoryId] || 0;
              const percentage = Math.min(
                Math.round((spent / budget.amount) * 100),
                100,
              );

              // Determine colors based on percentage
              let barColor =
                "bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-500 dark:to-teal-500";
              let textColor = "text-emerald-700 dark:text-emerald-400";

              if (percentage >= 100) {
                barColor =
                  "bg-gradient-to-r from-rose-400 to-red-500 dark:from-rose-500 dark:to-red-600";
                textColor = "text-rose-700 dark:text-rose-400";
              } else if (percentage >= 80) {
                barColor =
                  "bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-500";
                textColor = "text-amber-700 dark:text-amber-400";
              }

              const IconComponent = getIconComponent(category.icon);

              return (
                <div
                  key={budget.id}
                  className="relative overflow-hidden rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-5 shadow-lg group hover:-translate-y-1 transition-all cursor-pointer"
                  onClick={() => {
                    setEditingCategoryId(budget.categoryId);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: category.color || "#94a3b8" }}
                      >
                        {IconComponent ? (
                          <IconComponent size={16} className="text-white" />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {category.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-stone-800 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className={`text-2xl font-black ${textColor}`}>
                        ฿
                        {spent.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                        of ฿{budget.amount.toLocaleString()} limit
                      </p>
                    </div>
                    {percentage >= 80 && (
                      <div
                        className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${percentage >= 100 ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"}`}
                      >
                        <AlertCircle size={12} />
                        {percentage >= 100 ? "Over Budget" : "Near Limit"}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-3 w-full bg-stone-200 dark:bg-stone-700/50 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="text-right mt-1">
                    <span className={`text-[10px] font-bold ${textColor}`}>
                      {percentage}% Used
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        currentBudgets={budgets}
        onSave={handleSaveBudget}
        onDelete={handleDeleteBudget}
        defaultCategoryId={editingCategoryId}
        month={month}
        year={year}
      />
    </>
  );
}
