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
            className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-6 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer group relative overflow-hidden"
          >
            {/* Color Orb Mesh */}
            <div 
              className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-50 group-hover:scale-150 group-hover:opacity-70 transition-all duration-700 z-0" 
              style={{ backgroundColor: wallet.color || '#94a3b8' }} 
            />
            <div 
              className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full blur-2xl opacity-30 group-hover:scale-125 transition-all duration-700 z-0" 
              style={{ backgroundColor: wallet.color ? `${wallet.color}80` : '#cbd5e1' }} 
            />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                 {/* Icon / Type */}
                 <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-none rounded-full bg-white/60 dark:bg-black/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/50 dark:border-white/10 shadow-sm">
                       {wallet.icon ? (
                         <img 
                           src={wallet.icon} 
                           alt={wallet.name} 
                           className={cn(
                             "h-full w-full transition-transform duration-500 group-hover:scale-110",
                             wallet.type === "bank" ? "object-contain" : "object-cover"
                           )} 
                         />
                       ) : (
                         <div className={cn(
                           "h-full w-full flex items-center justify-center text-stone-600 dark:text-stone-300 font-black tracking-tighter"
                         )}>
                            <span className="capitalize text-[10px] uppercase">
                               {wallet.type.slice(0, 3)}
                            </span>
                         </div>
                       )}
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-stone-800 dark:text-white leading-tight drop-shadow-sm">{wallet.name}</h3>
                       <span className="text-xs font-semibold text-stone-600/80 dark:text-stone-400 capitalize bg-white/30 dark:bg-black/20 px-2 py-0.5 rounded-full mt-1 inline-block">{wallet.type}</span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-8">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1 opacity-80">Available Balance</p>
                <p className="text-3xl font-black text-stone-800 dark:text-white tracking-tighter drop-shadow-sm">
                  ฿{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Wallet Card Placeholder */}
        <WalletManager 
          trigger={
          <div className="hidden lg:flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/40 dark:border-white/10 bg-white/20 dark:bg-stone-800/20 backdrop-blur-sm p-6 hover:bg-white/40 dark:hover:bg-stone-800/40 hover:border-emerald-300/50 transition-all cursor-pointer group min-h-[200px]">
               <div className="h-14 w-14 rounded-full bg-stone-200/50 dark:bg-stone-700/50 backdrop-blur-md flex items-center justify-center mb-4 group-hover:scale-125 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 group-hover:text-emerald-600 transition-all duration-300 shadow-sm text-stone-500">
                 <Plus size={24} />
               </div>
               <span className="text-sm font-bold text-stone-500 dark:text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-wider">Create New Wallet</span>
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
