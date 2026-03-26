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
    <div className="rounded-xl border border-border bg-card shadow-sm p-4">
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
         <input
           type="text"
           value={newHabit}
           onChange={(e) => setNewHabit(e.target.value)}
           placeholder="New habit..."
           className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
         />
         <button 
           type="submit" 
           disabled={loading}
           className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity"
         >
           <Plus size={18} />
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
             <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/10">
                <div 
                  onClick={() => toggleHabit(habit.id, date)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                   <div className={cn(
                     "h-8 w-8 rounded-lg flex items-center justify-center transition-all border-2",
                     isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 hover:border-emerald-500/50"
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
