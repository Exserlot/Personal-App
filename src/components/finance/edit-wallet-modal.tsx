"use client";

import { useState, useRef } from "react";
import { Wallet, WalletType } from "@/types";
import {
  updateWallet,
  deleteWallet,
  uploadWalletIcon,
} from "@/lib/actions/finance";
import {
  Loader2,
  Save,
  Trash2,
  X,
  Wallet as WalletIcon,
  Upload,
  ImageIcon,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { THAI_BANKS } from "@/lib/banks";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const WALLET_TYPES: WalletType[] = [
  "cash",
  "bank",
  "credit",
  "investment",
  "other",
];

interface EditWalletModalProps {
  wallet: Wallet;
  isOpen: boolean;
  onClose: () => void;
}

import { GlobalModal } from "@/components/ui/global-modal";
import { SaveButton } from "@/components/ui/save-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { PREMIUM_INPUT_CLASS } from "@/lib/constants/styles";

export function EditWalletModal({
  wallet,
  isOpen,
  onClose,
}: EditWalletModalProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);

  const [name, setName] = useState(wallet.name);
  const [type, setType] = useState<WalletType>(wallet.type);
  const [balance, setBalance] = useState(wallet.balance.toString());
  const [icon, setIcon] = useState(wallet.icon || "");
  const [iconPreview, setIconPreview] = useState(wallet.icon || null);

  const [headerText, setHeaderText] = useState<string>("Edit Wallet");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateWallet(wallet.id, {
        name,
        type,
        balance: parseFloat(balance),
        icon,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteWallet(wallet.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleIconUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setIconPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload immediately
    const formData = new FormData();
    formData.append("icon", file);

    const result = await uploadWalletIcon(formData);
    if (result.success && result.path) {
      setIcon(result.path);
    }
  }

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Wallet"
      maxWidth="sm"
    >
      {/* Bank Selector Overlay */}
      {showBankSelector && (
        <div className="flex flex-col p-0 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-4">
            {Object.values(THAI_BANKS).map((bank) => (
              <button
                key={bank.symbol}
                type="button"
                onClick={() => {
                  setIcon(bank.icon);
                  setIconPreview(bank.icon);
                  setName((prev) =>
                    prev === wallet.name ? bank.nameEN : prev,
                  );
                  setShowBankSelector(false);
                }}
                className="flex flex-col items-center gap-2"
              >
                <div className="h-12 w-12 rounded-xl bg-white p-1.5 shadow-sm border border-border hover:scale-110 transition-transform">
                  <img
                    src={bank.icon}
                    alt={bank.symbol}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-center font-medium leading-tight line-clamp-2 text-muted-foreground">
                  {bank.nameEN}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between p-4 border-t border-white/20 dark:border-white/5">
            <button
              onClick={() => setShowBankSelector(false)}
              className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-white hover:text-black transition-colors duration-200"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {!showBankSelector && (
        <form
          onSubmit={handleUpdate}
          className="p-6 space-y-5 animate-in fade-in slide-in-from-right-4 duration-200"
        >
          {/* Icon Upload / Select */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/30 hover:bg-secondary/50 transition-colors shadow-inner">
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Icon"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <WalletIcon size={32} className="text-muted-foreground/50" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-7 w-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                <Upload size={12} />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleIconUpload(file);
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowBankSelector(true)}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
            >
              <Building2 size={12} />
              Select Bank Icon
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wallet Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(PREMIUM_INPUT_CLASS)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Current Balance
              {balance !== wallet.balance.toString() && (
                <span className="text-amber-500 text-[10px] normal-case font-normal flex items-center gap-1">
                  (Will create adjustment record)
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-lime-900 font-bold">
                ฿
              </span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className={cn(PREMIUM_INPUT_CLASS, "pl-10 text-lg font-bold")}
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all duration-200",
                    type === t
                      ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                      : "bg-background/10 border-border border-dashed border-dark-200 hover:brightness-200",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <DeleteButton
              onClick={() => setShowDeleteConfirm(true)}
              className="w-auto px-4"
              label=""
            />
            <SaveButton
              label="Save Changes"
              loading={loading}
              disabled={loading}
              className="flex-1"
            />
          </div>
        </form>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Wallet"
        message="Are you sure you want to delete this wallet record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </GlobalModal>
  );
}
