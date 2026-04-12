"use client";

import { useState, useEffect } from "react";
import { WishlistItem, WishlistPriority } from "@/types";
import { updateWishlistItem, deleteWishlistItem } from "@/lib/actions/wishlist";
import { X, Loader2, Save, Link as LinkIcon, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditWishlistModalProps {
  item: WishlistItem;
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITIES: { value: WishlistPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-emerald-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-rose-500" },
];

import { GlobalModal } from "@/components/ui/global-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function EditWishlistModal({ item, isOpen, onClose }: EditWishlistModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [priority, setPriority] = useState<WishlistPriority>(item.priority);
  const [url, setUrl] = useState(item.url || "");
  const [image, setImage] = useState(item.image || "");
  const [note, setNote] = useState(item.note || "");

  // Reset form when item changes
  useEffect(() => {
    setName(item.name);
    setPrice(item.price.toString());
    setPriority(item.priority);
    setUrl(item.url || "");
    setImage(item.image || "");
    setNote(item.note || "");
    setShowDeleteConfirm(false);
  }, [item, isOpen]);

  if (!isOpen) return null;

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    
    setLoading(true);
    try {
      await updateWishlistItem(item.id, {
        name,
        price: parseFloat(price),
        priority,
        url,
        image,
        note
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteWishlistItem(item.id);
      onClose();
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Item"
      maxWidth="md"
    >
      <form onSubmit={handleUpdate} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="What do you want?"
              required
            />
          </div>

          {/* Price & Priority */}
          <div className="flex gap-4">
             <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
             </div>
             <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</label>
                <div className="flex bg-secondary/50 p-1 rounded-xl h-[54px] items-center">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        "flex-1 h-full rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5",
                        priority === p.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                       <div className={cn("h-1.5 w-1.5 rounded-full", p.color)} />
                       {p.label}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <LinkIcon size={12} /> Link (Optional)
             </label>
             <input
               type="url"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
               placeholder="https://..."
             />
          </div>

           {/* Image URL */}
           <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <ImageIcon size={12} /> Image URL (Optional)
             </label>
             <input
               type="url"
               value={image}
               onChange={(e) => setImage(e.target.value)}
               className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
               placeholder="https://image..."
             />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</label>
             <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               className="w-full rounded-xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-inner px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-20"
               placeholder="Details..."
             />
          </div>

        </div>

        <div className="p-6 pt-4 border-t border-white/20 dark:border-white/5 shrink-0 bg-white/30 dark:bg-black/10 backdrop-blur-md flex gap-3">
           <button
             type="button"
             onClick={() => setShowDeleteConfirm(true)}
             disabled={loading}
             className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
           >
             <Trash2 size={20} />
           </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-primary py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item?"
        message={`This will permanently remove "${name}" from your wishlist.`}
        confirmText="Confirm"
        cancelText="Cancel"
        danger={true}
      />
    </GlobalModal>
  );
}
