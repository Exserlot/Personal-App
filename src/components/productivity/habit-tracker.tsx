"use client";

import { Habit } from "@/types";
import { addHabit, toggleHabit, deleteHabit } from "@/lib/actions/productivity";
import { useState } from "react";
import { Plus, Flame, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREMIUM_INPUT_CLASS } from "@/lib/constants/styles";

interface HabitTrackerProps {
  initialHabits: Habit[];
  date: string;
}

export function HabitTracker({ initialHabits, date }: HabitTrackerProps) {
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setLoading(true);
    try {
      await addHabit(newHabit);
      setNewHabit("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-lg p-6">
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
         <input
           type="text"
           value={newHabit}
           onChange={(e) => setNewHabit(e.target.value)}
           placeholder="New habit..."
           className={cn(PREMIUM_INPUT_CLASS, "flex-1 px-4 py-3 h-auto")}
         />
         <button 
           type="submit" 
           disabled={loading}
           className="bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
         >
           <Plus size={20} />
         </button>
       </form>

       <div className="space-y-3">
         {initialHabits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-white/10 rounded-2xl">
               Start a new habit!
            </div>
         )}
         {initialHabits.map(habit => {
           const isCompleted = habit.completedDates.includes(date);
           return (
             <div 
               key={habit.id} 
               className="group flex items-center justify-between p-3.5 rounded-2xl border border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all shadow-sm mb-2"
             >
                <div 
                  onClick={async () => {
                    const res = await toggleHabit(habit.id, date) as any;
                    if (res && res.success && res.isCompleting) {
                      if (res.newBadges && res.newBadges.length > 0) {
                        import("@/lib/confetti").then(m => m.fireBadgeConfetti());
                        alert(`🎉 You unlocked ${res.newBadges.length} new badge(s)!`);
                      } else if (res.expGained) {
                        import("@/lib/confetti").then(m => m.fireConfetti());
                      }
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer select-none flex-1"
                >
                   <div className={cn(
                     "h-12 w-12 rounded-xl flex items-center justify-center transition-all border-2",
                     isCompleted 
                      ? "bg-gradient-to-br from-orange-400 to-rose-500 border-none shadow-lg text-white scale-110" 
                      : "bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 hover:border-orange-400/50"
                   )}>
                      <Flame size={20} className={cn(isCompleted ? "fill-white" : "text-muted-foreground/30")} />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{habit.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">Streak: {habit.streak} days</span>
                        {habit.streak >= 3 && <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 size={16} />
                </button>
             </div>
           );
         })}
       </div>
    </div>
  );
}
