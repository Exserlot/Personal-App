"use client"

import { Wallet, Category } from "@/types";
import { TransactionForm } from "./transaction-form";
import { X } from "lucide-react";
import { GlobalModal } from "@/components/ui/global-modal";

interface AddTransactionModalProps {
  wallets: Wallet[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ wallets, categories, isOpen, onClose }: AddTransactionModalProps) {
  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Transaction"
      maxWidth="lg"
    >
      <div className="flex-1 overflow-y-auto p-1 pb-4">
        <TransactionForm 
          wallets={wallets} 
          categories={categories} 
          onSuccess={onClose}
          className="border-none shadow-none bg-transparent"
        />
      </div>
    </GlobalModal>
  );
}
