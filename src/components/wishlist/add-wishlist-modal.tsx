"use client";

import { useState } from "react";
import { WishlistItem, WishlistPriority } from "@/types";
import { addWishlistItem } from "@/lib/actions/wishlist";
import { X, Loader2, Save, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const PRIORITIES: { value: WishlistPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-emerald-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-rose-500" },
];

export function AddWishlistModal({ isOpen, onClose, userId }: AddWishlistModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [priority, setPriority] = useState<WishlistPriority>("medium");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    
    setLoading(true);
    try {
      await addWishlistItem({
        name,
        price: parseFloat(price),
        priority,
        url,
        image,
        note,
        userId
      });
      onClose();
      // Reset form
      setName("");
      setPrice("");
      setPriority("medium");
      setUrl("");
      setImage("");
      setNote("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
          <h3 className="text-lg font-bold">Add to Wishlist</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
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
                autoFocus
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

          <div className="p-6 pt-4 border-t border-border/50 shrink-0 bg-background">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
