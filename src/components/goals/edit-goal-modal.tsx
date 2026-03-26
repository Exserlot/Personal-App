"use client";

import { useState } from "react";
import { YearlyGoal, GoalStatus } from "@/types";
import { updateGoal, deleteGoal } from "@/lib/actions/goals";
import { X, Loader2, Save, Target, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface EditGoalModalProps {
  goal: YearlyGoal;
  isOpen: boolean;
  onClose: () => void;
}

const STATUSES: { value: GoalStatus; label: string; color: string }[] = [
  { value: "not_started", label: "Not Started", color: "bg-stone-500" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-500" },
  { value: "done", label: "Done", color: "bg-emerald-500" },
];

export function EditGoalModal({ goal, isOpen, onClose }: EditGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [year, setYear] = useState<number>(goal.year);
  const [status, setStatus] = useState<GoalStatus>(goal.status);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    
    setLoading(true);
    try {
      await updateGoal(goal.id, {
        title,
        description,
        year,
        status,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteGoal(goal.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-border overflow-hidden relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="text-primary" size={20} />
            Edit Goal
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
                required
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
            
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
              <div className="flex bg-secondary/50 p-1 rounded-xl h-[54px] items-center">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={cn(
                      "flex-1 h-full rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5",
                      status === s.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                      <div className={cn("h-1.5 w-1.5 rounded-full", s.color)} />
                      {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
               <textarea
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-24"
               />
            </div>

          </div>

          <div className="p-6 pt-4 border-t border-border/50 shrink-0 bg-background flex gap-3">
             <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting || loading}
              className="px-4 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center justify-center"
            >
              {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            </button>
            <button
              type="submit"
              disabled={loading || deleting}
              className="flex-1 rounded-xl bg-primary py-3 text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
}
