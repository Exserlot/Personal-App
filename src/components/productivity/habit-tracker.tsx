"use client";

import { Habit } from "@/types";
import { addHabit, toggleHabit, deleteHabit } from "@/lib/actions/productivity";
import { useState } from "react";
import { Plus, Flame, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    await addHabit(newHabit);
    setNewHabit("");
    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl shadow-lg p-6">
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
         <input
           type="text"
           value={newHabit}
           onChange={(e) => setNewHabit(e.target.value)}
           placeholder="New habit..."
           className="flex-1 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none shadow-inner"
         />
         <button 
           type="submit" 
           disabled={loading}
           className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-3 rounded-2xl hover:opacity-90 hover:shadow-md transition-all active:scale-95"
         >
           <Plus size={20} />
         </button>
       </form>

       <div className="space-y-3">
         {initialHabits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
               Start a new habit!
            </div>
         )}
         {initialHabits.map(habit => {
           const isCompleted = habit.completedDates.includes(date);
           return (
             <div key={habit.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/20 dark:border-white/5 bg-white/30 dark:bg-stone-800/30 backdrop-blur-xl hover:bg-white/50 dark:hover:bg-stone-800/50 transition-all shadow-sm mb-2">
                <div 
                  onClick={() => toggleHabit(habit.id, date)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                   <div className={cn(
                     "h-10 w-10 rounded-xl flex items-center justify-center transition-all border-2",
                     isCompleted ? "bg-gradient-to-br from-orange-400 to-rose-500 border-none shadow-md text-white scale-110" : "bg-white/50 dark:bg-stone-800 border-white/50 dark:border-white/10 hover:border-orange-400/50"
                   )}>
                      <Flame size={18} className={cn(isCompleted ? "fill-white" : "text-muted-foreground/50")} />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm leading-tight">{habit.name}</h4>
                      <span className="text-xs text-muted-foreground">Streak: {habit.streak} days</span>
                   </div>
                </div>
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="text-muted-foreground hover:text-rose-600 p-2 transition-colors"
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
