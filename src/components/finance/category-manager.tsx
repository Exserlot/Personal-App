"use client"

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TransactionType } from "@/types";
import { addCategory } from "@/lib/actions/finance";
import { cn } from "@/lib/utils";
import { 
  Loader2, Plus, X, 
  Wallet, Banknote, CreditCard, Landmark, 
  ShoppingBag, Coffee, Utensils, Zap, 
  Home, Car, Plane, GraduationCap, 
  Heart, Dumbbell, Smartphone, Wifi, Gift,
  Briefcase, Music, Film, Gamepad2
} from "lucide-react";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", 
  "#f43f5e", "#78716c"
];

const ICONS = [
  { name: "wallet", component: Wallet },
  { name: "banknote", component: Banknote },
  { name: "card", component: CreditCard },
  { name: "bank", component: Landmark },
  { name: "shopping", component: ShoppingBag },
  { name: "food", component: Utensils },
  { name: "coffee", component: Coffee },
  { name: "bills", component: Zap },
  { name: "home", component: Home },
  { name: "car", component: Car },
  { name: "travel", component: Plane },
  { name: "education", component: GraduationCap },
  { name: "health", component: Heart },
  { name: "fitness", component: Dumbbell },
  { name: "phone", component: Smartphone },
  { name: "internet", component: Wifi },
  { name: "gift", component: Gift },
  { name: "work", component: Briefcase },
  { name: "entertainment", component: Gamepad2 },
  { name: "music", component: Music },
];

export function CategoryManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0].name);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await addCategory(name, type, color, icon);
      setIsOpen(false);
      setName("");
      // Reset defaults
      setType("expense");
      setColor(COLORS[0]);
      setIcon(ICONS[0].name);
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const SelectedIcon = ICONS.find(i => i.name === icon)?.component || Plus;

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus size={14} />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-stone-900/80 backdrop-blur-3xl p-8 shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div 
                   className="h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg"
                   style={{ backgroundColor: color }}
                 >
                   <SelectedIcon size={20} />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold">New Category</h3>
                   <p className="text-xs text-muted-foreground">Organize your finances</p>
                 </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-secondary/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                    type === "income" 
                      ? "bg-background text-emerald-600 shadow-sm ring-1 ring-border" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                    type === "expense" 
                      ? "bg-background text-rose-600 shadow-sm ring-1 ring-border" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Expense
                </button>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="e.g. Salary, Groceries"
                  required
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</label>
                <div className="grid grid-cols-5 gap-2 bg-secondary/30 p-3 rounded-xl">
                  {ICONS.map(i => (
                    <button
                      key={i.name}
                      type="button"
                      onClick={() => setIcon(i.name)}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center transition-all duration-200",
                        icon === i.name 
                          ? "bg-primary text-primary-foreground shadow-sm scale-110" 
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <i.component size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color Label</label>
                <div className="flex flex-wrap gap-3 p-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "h-8 w-8 rounded-full transition-all duration-200 ring-2",
                        color === c ? "ring-offset-1 ring-primary scale-110" : "ring-transparent hover:scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 mt-4"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Create Category
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
