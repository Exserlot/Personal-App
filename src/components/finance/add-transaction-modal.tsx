"use client"

import { Wallet, Category } from "@/types";
import { TransactionForm } from "./transaction-form";
import { X } from "lucide-react";

interface AddTransactionModalProps {
  wallets: Wallet[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ wallets, categories, isOpen, onClose }: AddTransactionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
          <h3 className="text-lg font-bold">Add New Transaction</h3>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-1">
             <TransactionForm 
                wallets={wallets} 
                categories={categories} 
                onSuccess={onClose}
                className="border-none shadow-none bg-transparent" // Remove card styling inside modal
             />
        </div>
      </div>
    </div>
  );
}
