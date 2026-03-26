"use client";

import { useState } from "react";
import { YearlyGoal, GoalStatus } from "@/types";
import { addGoal } from "@/lib/actions/goals";
import { X, Loader2, Save, Target } from "lucide-react";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function AddGoalModal({ isOpen, onClose, userId }: AddGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    
    setLoading(true);
    try {
      await addGoal({
        title,
        description,
        year,
      });
      onClose();
      // Reset form
      setTitle("");
      setDescription("");
      setYear(new Date().getFullYear());
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
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="text-primary" size={20} />
            Add Yearly Goal
          </h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="What do you want to achieve?"
                required
                autoFocus
              />
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
               <textarea
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-24"
                 placeholder="More details about this goal..."
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
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
