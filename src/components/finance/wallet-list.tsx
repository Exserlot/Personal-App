"use client"

import { Wallet } from "@/types";
import { Plus } from "lucide-react";
import { WalletManager } from "./wallet-manager";
import { EditWalletModal } from "./edit-wallet-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WalletListProps {
  wallets: Wallet[];
}

export function WalletList({ wallets }: WalletListProps) {
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">My Wallets</h2>
        <WalletManager />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            onClick={() => setEditingWallet(wallet)}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
               {/* Icon / Type */}
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-none rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm">
                     {wallet.icon ? (
                       <img 
                         src={wallet.icon} 
                         alt={wallet.name} 
                         className={cn(
                           "h-full w-full transition-transform group-hover:scale-110",
                           wallet.type === "bank" ? "object-contain" : "object-cover"
                         )} 
                       />
                     ) : (
                       <div className={cn(
                         "h-full w-full flex items-center justify-center bg-primary/10 text-primary"
                       )}>
                          <span className="capitalize text-[10px] font-bold opacity-70">
                             {wallet.type.slice(0, 2)}
                          </span>
                       </div>
                     )}
                  </div>
                  <div>
                     <h3 className="text-base font-bold text-foreground leading-tight">{wallet.name}</h3>
                     <span className="text-xs text-muted-foreground capitalize">{wallet.type}</span>
                  </div>
               </div>
            </div>
            
            <p className="text-2xl font-bold text-foreground tracking-tight">
              ฿{wallet.balance.toLocaleString()}
            </p>
          </div>
        ))}

        {/* Add New Wallet Card Placeholder */}
        <WalletManager 
          trigger={
            <div className="hidden lg:flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-transparent p-6 hover:bg-secondary/30 hover:border-primary/30 transition-all cursor-pointer group min-h-[140px]">
               <div className="h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm text-muted-foreground">
                 <Plus />
               </div>
               <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Create New Wallet</span>
            </div>
          }
        />
      </div>
      
      {editingWallet && (
        <EditWalletModal 
          wallet={editingWallet} 
          isOpen={true} 
          onClose={() => setEditingWallet(null)} 
        />
      )}
    </div>
  );
}
