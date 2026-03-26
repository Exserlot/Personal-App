"use client"

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Category, TransactionType } from "@/types";
import { updateCategory, deleteCategory, addCategory } from "@/lib/actions/finance";
import { 
  Loader2, X, Plus, Trash2, Save, Edit2,
  Wallet, Banknote, CreditCard, Landmark, 
  ShoppingBag, Coffee, Utensils, Zap, 
  Home, Car, Plane, GraduationCap, 
  Heart, Dumbbell, Smartphone, Wifi, Gift,
  Briefcase, Music, Film, Gamepad2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageCategoriesModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

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
  { name: "circle", component: Plus }, // Fallback/Default
];

export function ManageCategoriesModal({ categories, isOpen, onClose }: ManageCategoriesModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("circle");

  // Create State (Mini Form)
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newIcon, setNewIcon] = useState(ICONS[0].name);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const filteredCategories = categories.filter(c => c.type === activeTab);

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      const cat = categories.find(c => c.id === id);
      if (cat) {
        await updateCategory({ 
          ...cat, 
          name: editName, 
          color: editColor,
          icon: editIcon 
        });
        setEditingId(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await deleteCategory(deleteId);
      if (!res.success) {
        alert(res.error || "Failed to delete");
      }
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await addCategory(newName, activeTab, newColor, newIcon);
      setIsCreating(false);
      setNewName("");
      setNewColor(COLORS[0]);
      setNewIcon(ICONS[0].name);
    } finally {
      setLoading(false);
    }
  }

  // Helper to start editing
  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditColor(c.color ?? COLORS[0]);
    setEditIcon(c.icon ?? "circle");
  }

  const getIconComponent = (name?: string) => {
    return ICONS.find(i => i.name === name)?.component || Plus;
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl ring-1 ring-border flex flex-col max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Delete Confirmation Overlay */}
        {deleteId && (
           <div className="absolute inset-0 bg-background/95 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200 rounded-2xl">
              <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600 shadow-sm">
                 <Trash2 size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Delete Category?</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-[240px]">
                You can't delete categories that have related transactions.
              </p>
              <div className="flex w-full gap-3 max-w-xs">
                 <button 
                   onClick={() => setDeleteId(null)}
                   className="flex-1 py-2.5 rounded-xl border border-border font-semibold hover:bg-secondary transition-colors text-sm"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   disabled={loading}
                   className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-rose-200"
                 >
                   {loading && <Loader2 className="animate-spin" size={16} />}
                   Confirm
                 </button>
              </div>
           </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-xl font-bold">Manage Categories</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary p-1 rounded-xl mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("income")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === "income" ? "bg-background shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab("expense")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === "expense" ? "bg-background shadow-sm text-rose-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Expense
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
           {filteredCategories.map(c => {
             const IconComponent = getIconComponent(c.icon);
             return (
              <div key={c.id} className="flex flex-col p-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors">
                 {editingId === c.id ? (
                    <div className="space-y-3 animate-in fade-in">
                       <div className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="flex-1 bg-background border border-input rounded-lg px-3 py-1.5 text-sm"
                            placeholder="Category Name"
                          />
                          <button onClick={() => handleUpdate(c.id)} disabled={loading} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                             <Save size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg">
                             <X size={18} />
                          </button>
                       </div>
                       
                       {/* Edit Icons */}
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {ICONS.slice(0, 10).map(icon => (
                             <button
                               key={icon.name}
                               onClick={() => setEditIcon(icon.name)}
                               className={cn(
                                 "flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center transition-all",
                                 editIcon === icon.name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                               )}
                             >
                               <icon.component size={16} />
                             </button>
                          ))}
                       </div>

                       {/* Edit Colors */}
                       <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-hide">
                          {COLORS.map(col => (
                             <button 
                               key={col} 
                               onClick={() => setEditColor(col)}
                               className={cn("h-6 w-6 rounded-full ring-2 flex-shrink-0", editColor === col ? "ring-primary scale-110" : "ring-transparent")} 
                               style={{ backgroundColor: col }}
                             />
                          ))}
                       </div>
                    </div>
                 ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full shadow-sm ring-1 ring-border/50 flex items-center justify-center text-white" style={{ backgroundColor: c.color }}>
                            <IconComponent size={14} />
                         </div>
                         <span className="font-medium">{c.name}</span>
                      </div>
                      <div className="flex gap-1">
                         <button onClick={() => startEdit(c)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            <Edit2 size={16} />
                         </button>
                         <button onClick={() => setDeleteId(c.id)} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                 )}
              </div>
             );
           })}

           {filteredCategories.length === 0 && (
             <div className="text-center py-8 text-muted-foreground text-sm">
               No categories yet.
             </div>
           )}
        </div>

        {/* Add New Section */}
        <div className="mt-4 pt-4 border-t border-border shrink-0">
           {isCreating ? (
              <div className="animate-in slide-in-from-bottom-2 fade-in space-y-3 bg-secondary/30 p-3 rounded-xl">
                 <input 
                   type="text"
                   placeholder="New Category Name"
                   value={newName}
                   onChange={e => setNewName(e.target.value)}
                   className="w-full rounded-lg border border-input px-3 py-2 text-sm mb-2"
                 />
                 
                 {/* Icons */}
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {ICONS.map(icon => (
                       <button
                         key={icon.name}
                         onClick={() => setNewIcon(icon.name)}
                         className={cn(
                           "flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center transition-all",
                           newIcon === icon.name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                         )}
                       >
                         <icon.component size={16} />
                       </button>
                    ))}
                 </div>

                 {/* Colors */}
                 <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-hide">
                    {COLORS.map(col => (
                       <button 
                         key={col} 
                         onClick={() => setNewColor(col)}
                         className={cn("h-7 w-7 rounded-full ring-2 transition-all flex-shrink-0", newColor === col ? "ring-primary scale-110" : "ring-transparent")} 
                         style={{ backgroundColor: col }}
                       />
                    ))}
                 </div>

                 <div className="flex gap-2 mt-2">
                    <button onClick={() => setIsCreating(false)} className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                    <button onClick={handleCreate} disabled={loading} className="flex-1 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg shadow-sm">
                       {loading ? <Loader2 className="animate-spin inline mr-2" size={14}/> : 'Save'}
                    </button>
                 </div>
              </div>
           ) : (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add New {activeTab === "income" ? "Income" : "Expense"} Category
              </button>
           )}
        </div>

      </div>
    </div>,
    document.body
  );
}
