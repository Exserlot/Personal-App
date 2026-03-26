"use client"

import { useState, useRef } from "react";
import { Wallet, Category, TransactionType } from "@/types";
import { addTransaction, uploadSlipAndCreateTransaction, uploadSlip } from "@/lib/actions/finance";
import { cn } from "@/lib/utils";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { CategoryManager } from "./category-manager";
import { ManageCategoriesModal } from "./manage-categories-modal";
import { CustomSelect } from "@/components/ui/custom-select";

interface TransactionFormProps {
  wallets: Wallet[];
  categories: Category[];
  onSuccess?: () => void;
  className?: string;
}

export function TransactionForm({ wallets, categories, onSuccess, className }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [walletId, setWalletId] = useState(wallets[0]?.id || "");
  const [targetWalletId, setTargetWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isFromQR, setIsFromQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert("Source and target wallets must be different.");
      return;
    }

    setLoading(true);
    try {
      let slipId: string | undefined;

      // Update: If there's a slip file, upload it first
      if (slipFile) {
        const formData = new FormData();
        formData.append("slip", slipFile);
        formData.append("note", note); // Optional: add note to slip as well

        // Assuming uploadSlip is imported from actions
        const uploadResult = await uploadSlip(formData);
        
        if (uploadResult.success && uploadResult.slip) {
          slipId = uploadResult.slip.id;
        } else {
           console.error("Failed to upload slip:", uploadResult.error);
           alert("Failed to upload slip, but continuing with transaction creation.");
        }
      }

      const txData = {
          date: new Date().toISOString(),
          amount: parseFloat(amount),
          type,
          walletId,
          categoryId,
          note,
          slipId,
          targetWalletId: type === "transfer" ? targetWalletId : undefined
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

      const result = await uploadSlipAndCreateTransaction(formData);
      
      if (result.success && result.transaction && result.slip) {
        // QR scan successful - transaction already created
        setIsFromQR(true);
        alert(`Transaction created from QR! Amount: ฿${result.transaction.amount}`);
        resetForm();
      } else if (result.error && result.error.includes("No QR code")) {
        // No QR found - let user enter manually
        setIsFromQR(false);
      } else if (result.error) {
        // Other error
        alert(result.error);
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

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
      
      <div className="flex p-1 bg-secondary/40 rounded-xl mb-6 border border-border/50">
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-out",
            type === "income" 
              ? "bg-background text-emerald-600 shadow-sm ring-1 ring-border/50 dark:text-emerald-400" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/20">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 px-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0.00"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 px-2">Wallet</label>
            <CustomSelect
              value={walletId}
              onChange={setWalletId}
              options={wallets.map(w => ({
                id: w.id,
                label: w.name,
                subLabel: `฿${w.balance.toLocaleString()}`
              }))}
              placeholder="Select Wallet"
            />
          </div>

          {type === "transfer" && (
            <div>
              <label className="block text-sm font-medium mb-1 px-2">To Wallet</label>
              <CustomSelect
                value={targetWalletId}
                onChange={setTargetWalletId}
                options={wallets
                  .filter(w => w.id !== walletId)
                  .map(w => ({
                    id: w.id,
                    label: w.name,
                    subLabel: `฿${w.balance.toLocaleString()}`
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
                options={filteredCategories.map(c => ({
                  id: c.id,
                  label: c.name,
                  color: c.color,
                  icon: <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
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
          <label className="block text-sm font-medium mb-1 px-2">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Lunch, Salary, etc."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Save Transaction
        </button>
      </form>
    </div>
  );
}
