"use client";

import { useState, useRef } from "react";
import { Wallet, Category, TransactionType } from "@/types";
import {
  addTransaction,
  uploadSlipAndCreateTransaction,
  uploadSlip,
} from "@/lib/actions/finance";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Upload,
  X,
  ImageIcon,
  ChevronUp,
  ChevronDown,
  Save,
} from "lucide-react";
import { CategoryManager } from "./category-manager";
import { ManageCategoriesModal } from "./manage-categories-modal";
import { CustomSelect } from "@/components/ui/custom-select";
import { AlertDialog, AlertType } from "@/components/ui/alert-dialog";
import { MultiSlipUploadView } from "./multi-slip-upload-view";
import { SaveButton } from "@/components/ui/save-button";
import {
  PREMIUM_INPUT_CLASS,
  PREMIUM_TEXTAREA_CLASS,
} from "@/lib/constants/styles";

interface TransactionFormProps {
  wallets: Wallet[];
  categories: Category[];
  onSuccess?: () => void;
  className?: string;
  isModal?: boolean;
}

export function TransactionForm({
  wallets,
  categories,
  onSuccess,
  className,
  isModal,
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [uploadedSlipId, setUploadedSlipId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [walletId, setWalletId] = useState(wallets[0]?.id || "");
  const [targetWalletId, setTargetWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "multi">("single");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isFromQR, setIsFromQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  const showAlert = (
    title: string,
    message: string,
    type: AlertType = "error",
  ) => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    if (newType === "transfer") {
      setCategoryId("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walletId || !amount) return;
    if (type !== "transfer" && !categoryId) return; // Category required only for non-transfers
    if (type === "transfer" && !targetWalletId) return;
    if (type === "transfer" && walletId === targetWalletId) {
      showAlert(
        "Invalid Transfer",
        "Source and target wallets must be different.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      let slipId: string | undefined = uploadedSlipId || undefined;

      // Update: If there's a slip file and it wasn't uploaded during QR scan, upload it first
      if (!slipId && slipFile && !isFromQR) {
        const formData = new FormData();
        formData.append("slip", slipFile);
        formData.append("note", note); // Optional: add note to slip as well

        // Assuming uploadSlip is imported from actions
        const uploadResult = await uploadSlip(formData);

        if (uploadResult.success && uploadResult.slip) {
          slipId = uploadResult.slip.id;
        } else {
          console.error("Failed to upload slip:", uploadResult.error);
          showAlert(
            "Upload Info",
            "Failed to upload slip, but continuing with transaction creation.",
            "info",
          );
        }
      }

      let finalDate = new Date();
      if (date !== finalDate.toISOString().split("T")[0]) {
        finalDate = new Date(date);
      }

      const txData = {
        date: finalDate.toISOString(),
        amount: parseFloat(amount),
        type,
        walletId,
        categoryId,
        note,
        slipId,
        targetWalletId: type === "transfer" ? targetWalletId : undefined,
      };

      await addTransaction(txData as any); // Type assertion needed until backend definitions are fully propagated if strict checks fail, but actually the type should match now.

      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSlipUpload(file: File) {
    setSlipFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Try to scan QR and auto-fill
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("slip", file);
      formData.append("note", note);

      const result = await uploadSlip(formData, { requireQR: true });

      if (result.success && result.slip) {
        setUploadedSlipId(result.slip.id);
        setIsFromQR(true);

        if (result.slip.qrData && result.slip.qrData.amount) {
          setAmount(String(result.slip.qrData.amount));
          showAlert(
            "Slip Attached",
            `Detected amount: ฿${result.slip.qrData.amount}. Please review date and save.`,
            "success",
          );
        } else {
          showAlert(
            "Slip Attached",
            "Uploaded successfully but could not detect amount. Please enter it manually.",
            "info",
          );
        }
      } else if (result.error) {
        showAlert("Upload Failed", result.error, "error");
        setSlipFile(null);
        setSlipPreview(null);
      }
    } catch (error) {
      console.error("Error scanning QR:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setUploadedSlipId(null);
    setSlipFile(null);
    setSlipPreview(null);
    setIsFromQR(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeSlip() {
    setSlipFile(null);
    setSlipPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  if (viewMode === "multi") {
    return (
      <div
        className={cn(
          isModal
            ? "p-2 min-h-[500px]"
            : "rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-2xl min-h-[600px]",
          className,
        )}
      >
        <MultiSlipUploadView
          onCancel={() => setViewMode("single")}
          wallets={wallets}
          categories={categories}
          onSuccess={() => {
            setViewMode("single");
            if (onSuccess) onSuccess();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        isModal
          ? "p-1"
          : "rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg",
        className,
      )}
    >
      {!isModal && (
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
      )}

      <div className="flex p-1 bg-secondary/40 rounded-xl mb-6 border border-border/50">
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out",
            type === "income"
              ? "bg-background text-emerald-600 shadow-sm ring-1 ring-border/50 dark:text-emerald-400"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          )}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out",
            type === "expense"
              ? "bg-background text-rose-600 shadow-sm ring-1 ring-border/50 dark:text-rose-400"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          )}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("transfer")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out",
            type === "transfer"
              ? "bg-background text-blue-600 shadow-sm ring-1 ring-border/50 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          )}
        >
          Transfer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Slip */}
        <div>
          <label className="block text-sm font-medium mb-2 px-2">
            Upload Payment Slip (Optional)
          </label>

          {!slipPreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-primary group-hover:-translate-y-1 transition-transform" />
                <p className="font-bold text-sm text-primary">
                  Click to upload single slip
                </p>
                <p className="text-xs text-primary/70 mt-1">
                  or drag and drop here
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSlipUpload(file);
                }}
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={slipPreview}
                alt="Payment slip preview"
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={removeSlip}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
              {isFromQR && (
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <ImageIcon size={12} />
                  Transaction Created from QR
                </div>
              )}
            </div>
          )}

          {/* Multi Slip Upload Trigger */}
          <button
            type="button"
            onClick={() => setViewMode("multi")}
            className="gradient-border-mask w-full mt-3 rounded-lg py-3 flex items-center justify-center gap-2 transition-all hover:bg-gradient-to-r hover:from-pink-500 hover:to-violet-500 hover:border-transparent hover:scale-[1.01] hover:shadow-md active:scale-[0.99] group bg-transparent cursor-pointer"
          >
            <Upload className="w-5 h-5 text-pink-500 dark:text-pink-400 group-hover:text-white transition-all" />
            <div className="relative flex items-center justify-center">
              <span className="font-bold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 dark:from-pink-400 dark:to-violet-400 group-hover:opacity-0 transition-opacity">
                Upload Multiple Slips
              </span>
              <span className="font-bold text-sm tracking-wide text-white absolute opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Upload Multiple Slips
              </span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block px-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              lang="en-GB"
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                PREMIUM_INPUT_CLASS,
                "dark:[color-scheme:dark] dark:[&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
              )}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block px-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  PREMIUM_INPUT_CLASS,
                  "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] pr-12",
                )}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-[1px]">
                <button
                  type="button"
                  onClick={() =>
                    setAmount((prev) =>
                      String(
                        Math.max(0, parseFloat(prev || "0") + 1).toFixed(2),
                      ),
                    )
                  }
                  className="p-[1px] rounded-sm border border-border/50 bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                >
                  <ChevronUp size={10} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAmount((prev) =>
                      String(
                        Math.max(0, parseFloat(prev || "0") - 1).toFixed(2),
                      ),
                    )
                  }
                  className="p-[1px] rounded-sm border border-border/50 bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                >
                  <ChevronDown size={10} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block px-2">
              Wallet
            </label>
            <CustomSelect
              value={walletId}
              onChange={setWalletId}
              options={wallets.map((w) => ({
                id: w.id,
                label: w.name,
                subLabel: `฿${w.balance.toLocaleString()}`,
              }))}
              placeholder="Select Wallet"
            />
          </div>

          {type === "transfer" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block px-2">
                To Wallet
              </label>
              <CustomSelect
                value={targetWalletId}
                onChange={setTargetWalletId}
                options={wallets
                  .filter((w) => w.id !== walletId)
                  .map((w) => ({
                    id: w.id,
                    label: w.name,
                    subLabel: `฿${w.balance.toLocaleString()}`,
                  }))}
                placeholder="Select Target Wallet"
              />
            </div>
          )}

          {type !== "transfer" && (
            <div>
              <div className="flex items-center justify-between mb-1 px-2">
                <label className="block text-sm font-medium">Category</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManageCategories(true)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    Manage
                  </button>
                  <CategoryManager />
                </div>
              </div>
              <CustomSelect
                value={categoryId}
                onChange={setCategoryId}
                options={filteredCategories.map((c) => ({
                  id: c.id,
                  label: c.name,
                  color: c.color,
                  icon: (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  ),
                }))}
                placeholder="Select Category"
              />
            </div>
          )}
        </div>

        {showManageCategories && (
          <ManageCategoriesModal
            categories={categories}
            isOpen={true}
            onClose={() => setShowManageCategories(false)}
          />
        )}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block px-2">
            Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={cn(PREMIUM_INPUT_CLASS)}
            placeholder="Lunch, Salary, etc."
          />
        </div>

        <SaveButton
          label="Save Transaction"
          loading={loading}
          disabled={loading}
        />
      </form>

      {/* Custom Alert Dialog overlay */}
      <AlertDialog
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
