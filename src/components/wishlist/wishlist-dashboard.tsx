"use client";

import { useState } from "react";
import { WishlistItem, Wallet } from "@/types";
import { AddWishlistModal } from "./add-wishlist-modal";
import { EditWishlistModal } from "./edit-wishlist-modal";
import { Plus, ExternalLink, Trash2, Check, ShoppingBag, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteWishlistItem, markAsBought, restoreFromBought, updateWishlistItem } from "@/lib/actions/wishlist";
import { ConfirmPurchaseModal } from "./confirm-purchase-modal";

interface WishlistDashboardProps {
  items: WishlistItem[];
  wallets: Wallet[];
  defaultWalletId?: string;
  userId: string; // For future user scoping
}

export function WishlistDashboard({ items, wallets, defaultWalletId, userId }: WishlistDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [purchasingItem, setPurchasingItem] = useState<WishlistItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activeItems = items.filter(i => i.status === "active");
  const boughtItems = items.filter(i => i.status === "bought");

  async function handleBuy(e: React.MouseEvent, item: WishlistItem) {
    e.stopPropagation();
    setPurchasingItem(item);
  }

  async function handleConfirmPurchase(walletId?: string) {
    if (!purchasingItem) return;
    setLoadingId(purchasingItem.id);
    await markAsBought(purchasingItem.id, walletId);
    setLoadingId(null);
    setPurchasingItem(null);
  }

  async function handleRestore(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setLoadingId(id);
    await restoreFromBought(id);
    setLoadingId(null);
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    setLoadingId(deletingItem.id);
    await deleteWishlistItem(deletingItem.id);
    setLoadingId(null);
    setDeletingItem(null);
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-primary" />
            Wishlist
          </h2>
          <p className="text-muted-foreground">Manage your shopping list and goals.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Active Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => setEditingItem(item)}
            className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
          >
            
            {/* Image / Placeholder */}
            <div className="aspect-video bg-secondary/30 relative overflow-hidden">
               {item.image ? (
                 <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ShoppingBag size={48} />
                 </div>
               )}
               {/* Priority Badge */}
               <div className={cn(
                 "absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md bg-white/90 text-stone-800",
                 item.priority === "high" && "text-rose-600 bg-rose-50/90",
                 item.priority === "medium" && "text-amber-600 bg-amber-50/90",
                 item.priority === "low" && "text-emerald-600 bg-emerald-50/90"
               )}>
                 {item.priority}
               </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
               <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-2"
                    >
                       <ExternalLink size={16} />
                    </a>
                  )}
               </div>
               
               {item.note && <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{item.note}</p>}
               
               <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-bold text-lg text-primary">฿{item.price.toLocaleString()}</span>
                  
                  <div className="flex gap-1">
                     <button
                       onClick={(e) => handleBuy(e, item)}
                       disabled={loadingId === item.id}
                       className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shadow-sm"
                       title="Mark as Bought"
                     >
                       <Check size={18} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {activeItems.length === 0 && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all min-h-[200px]"
          >
             <ShoppingBag size={32} className="mb-2 opacity-50" />
             <span className="font-medium">Your Wishlist is empty</span>
             <span className="text-xs">Add something you want to buy</span>
          </button>
        )}
      </div>

      {/* Bought Items (Collapsed/Secondary) */}
      {boughtItems.length > 0 && (
        <div className="pt-8 border-t border-border">
          <h3 className="text-lg font-bold mb-4 opacity-70">Purchased Items</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-60 hover:opacity-100 transition-opacity">
            {boughtItems.map(item => (
               <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20">
                  {item.image ? (
                     <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-border">
                       <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                     </div>
                  ) : (
                     <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check size={18} />
                     </div>
                  )}
                  <div className="min-w-0 flex-1">
                     <h4 className="font-medium text-sm truncate line-through">{item.name}</h4>
                     <p className="text-xs text-muted-foreground">฿{item.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={(e) => handleRestore(e, item.id)}
                    className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded text-muted-foreground transition-colors"
                    title="Return to Wishlist"
                  >
                     <RotateCcw size={14} />
                  </button>
                  <button 
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 hover:bg-rose-100 hover:text-rose-600 rounded text-muted-foreground transition-colors"
                  >
                     <Trash2 size={14} />
                  </button>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB for Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center sm:hidden hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <AddWishlistModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        userId={userId}
      />

      {editingItem && (
        <EditWishlistModal
          item={editingItem}
          isOpen={true}
          onClose={() => setEditingItem(null)}
        />
      )}

      {purchasingItem && (
        <ConfirmPurchaseModal
          isOpen={true}
          onClose={() => setPurchasingItem(null)}
          onConfirm={handleConfirmPurchase}
          item={purchasingItem}
          wallets={wallets}
          defaultWalletId={defaultWalletId}
        />
      )}

      {deletingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => setDeletingItem(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl ring-1 ring-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-600">
               <Trash2 size={24} />
               Delete Item
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete <span className="font-bold text-foreground">{deletingItem.name}</span> from your purchased history? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-border font-bold hover:bg-secondary transition-colors text-muted-foreground"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={loadingId === deletingItem.id}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
