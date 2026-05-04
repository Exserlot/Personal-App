"use client";

import { useState, useEffect } from "react";
import { X, Save, Calculator } from "lucide-react";
import { Category, Budget } from "@/types";
import { CustomSelect } from "@/components/ui/custom-select";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteButton } from "@/components/ui/delete-button";
import { GlobalModal } from "@/components/ui/global-modal";
import { SaveButton } from "@/components/ui/save-button";
import { PREMIUM_INPUT_CLASS } from "@/lib/constants/styles";
import { cn } from "@/lib/utils";

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentBudgets: Budget[];
  onSave: (categoryId: string, amount: number) => Promise<void>;
  onDelete: (budgetId: string) => Promise<void>;
  defaultCategoryId?: string | null;
  month: number;
  year: number;
}

export function SetBudgetModal({
  isOpen,
  onClose,
  categories,
  currentBudgets,
  onSave,
  onDelete,
  defaultCategoryId,
  month,
  year,
}: SetBudgetModalProps) {
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingBudget = currentBudgets.find((b) => b.categoryId === categoryId);
  const isEditing = !!existingBudget;

  useEffect(() => {
    if (isOpen) {
      const targetCategoryId = defaultCategoryId || expenseCategories[0]?.id || "";
      setCategoryId(targetCategoryId);
      const existing = currentBudgets.find((b) => b.categoryId === targetCategoryId);
      if (existing) {
        setAmount(existing.amount.toString());
      } else {
        setAmount("");
      }
      setShowDeleteConfirm(false);
    }
  }, [isOpen, defaultCategoryId, currentBudgets]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;

    setIsSaving(true);
    await onSave(categoryId, parseFloat(amount));
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!existingBudget) return;
    setIsDeleting(true);
    await onDelete(existingBudget.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={defaultCategoryId ? "Edit Budget Limit" : "Set Budget Limit"}
      maxWidth="sm"
    >
      <form
        onSubmit={handleSave}
        className="p-6 space-y-5 animate-in fade-in slide-in-from-right-4 duration-200"
      >
        {/* Helper text showing month/year */}
        <div className="flex items-center gap-2 mb-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
          <Calculator size={18} />
          <span>
            Budget for {monthName} {year}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <CustomSelect
            value={categoryId}
            onChange={setCategoryId}
            options={expenseCategories.map((c) => ({
              id: c.id,
              label: c.name,
              icon: (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: c.color || "#94a3b8" }}
                ></span>
              ),
            }))}
            disabled={!!defaultCategoryId}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            Amount Limit (฿)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-800 font-bold">
              ฿
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(PREMIUM_INPUT_CLASS, "pl-10 text-lg font-bold")}
              placeholder="e.g. 5000"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          {isEditing && (
            <DeleteButton
              onClick={() => setShowDeleteConfirm(true)}
              className="w-auto px-4"
              label=""
            />
          )}
          <SaveButton
            label="Save Budget"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          />
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget limit? This will stop tracking progress for this category."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </GlobalModal>
  );
}
