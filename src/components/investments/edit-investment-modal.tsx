"use client";

import { useState } from "react";
import { InvestmentAsset, InvestmentType } from "@/types";
import { updateInvestment, deleteInvestment } from "@/lib/actions/investments";
import { X, Loader2, Save, TrendingUp, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import {
  PREMIUM_INPUT_CLASS,
  PREMIUM_TEXTAREA_CLASS,
} from "@/lib/constants/styles";

interface EditInvestmentModalProps {
  investment: InvestmentAsset;
  isOpen: boolean;
  onClose: () => void;
}

const TYPES: { id: InvestmentType; label: string }[] = [
  { id: "stock", label: "Stock/ETF" },
  { id: "crypto", label: "Crypto" },
  { id: "fund", label: "Mutual Fund" },
  { id: "other", label: "Other" },
];

import { GlobalModal } from "@/components/ui/global-modal";
import { SaveButton } from "@/components/ui/save-button";
import { DeleteButton } from "@/components/ui/delete-button";

export function EditInvestmentModal({
  investment,
  isOpen,
  onClose,
}: EditInvestmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState(investment.name);
  const [type, setType] = useState<InvestmentType>(investment.type);
  const [amountInvested, setAmountInvested] = useState(
    investment.amountInvested.toString(),
  );
  const [currentValue, setCurrentValue] = useState(
    investment.currentValue.toString(),
  );
  const [note, setNote] = useState(investment.note || "");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !amountInvested || !currentValue) return;

    setLoading(true);
    try {
      await updateInvestment(investment.id, {
        name,
        type,
        amountInvested: parseFloat(amountInvested),
        currentValue: parseFloat(currentValue),
        note,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteInvestment(investment.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <TrendingUp className="text-primary" size={20} />
          Edit Investment
        </>
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Asset Name / Symbol
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(PREMIUM_INPUT_CLASS)}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Asset Type
            </label>
            <CustomSelect
              options={TYPES}
              value={type}
              onChange={(val) => setType(val as InvestmentType)}
            />
          </div>

          {/* Amount Invested & Current Value */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Principal (Cost)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-lime-900 font-bold">
                  ฿
                </span>
                <input
                  type="number"
                  value={amountInvested}
                  onChange={(e) => setAmountInvested(e.target.value)}
                  className={cn(
                    PREMIUM_INPUT_CLASS,
                    "pl-10 py-3 text-md font-bold",
                  )}
                  required
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Value
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-lime-900 font-bold">
                  ฿
                </span>
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className={cn(
                    PREMIUM_INPUT_CLASS,
                    "pl-10 py-3 text-md font-bold",
                  )}
                  required
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={cn(PREMIUM_TEXTAREA_CLASS, "h-20")}
            />
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-white/20 dark:border-white/5 shrink-0 flex gap-3">
          <DeleteButton
            onClick={() => setShowDeleteConfirm(true)}
            loading={deleting}
            disabled={deleting || loading}
            className="w-auto px-4"
            label=""
          />
          <SaveButton
            label="Save Changes"
            loading={loading}
            disabled={loading || deleting}
            className="flex-1"
          />
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Investment"
        message="Are you sure you want to delete this asset record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </GlobalModal>
  );
}
