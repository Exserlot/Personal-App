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
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
           <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                 <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Delete Item?</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-[240px]">
                This will permanently remove "{name}" from your wishlist.
              </p>
              <div className="flex w-full gap-3">
                 <button 
                   onClick={() => setShowDeleteConfirm(false)}
                   className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-secondary transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   disabled={loading}
                   className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                 >
                   {loading && <Loader2 className="animate-spin" size={18} />}
                   Confirm
                 </button>
              </div>
           </div>
        )}

        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
          <h3 className="text-lg font-bold">Edit Item</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                      className="w-full rounded-xl border border-input bg-secondary/50 pl-8 pr-4 py-3 text-lg font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                 placeholder="https://image..."
               />
            </div>

            {/* Note */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</label>
               <textarea
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-20"
                 placeholder="Details..."
               />
            </div>

          </div>

          <div className="p-6 pt-4 border-t border-border/50 shrink-0 bg-background flex gap-3">
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
      </div>
    </div>
  );
}
