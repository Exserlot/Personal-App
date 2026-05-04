"use client";

import { useState } from "react";
import { Task } from "@/types";
import { addTask, toggleTask, deleteTask, migrateIncompleteTasks } from "@/lib/actions/productivity";
import { Plus, Trash2, CalendarDays, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREMIUM_INPUT_CLASS } from "@/lib/constants/styles";

interface TodoListProps {
  initialTasks: Task[];
  date: string;
}

export function TodoList({ initialTasks, date }: TodoListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setLoading(true);
    try {
      await addTask(newTask, date);
      setNewTask("");
    } finally {
      setLoading(false);
    }
  }

  async function handleMigrate() {
     if(!confirm("Move incomplete tasks to tomorrow?")) return;
     await migrateIncompleteTasks(date);
  }

  return (
    <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-lg p-6">
       <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
             <CalendarDays size={14} />
             {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <button 
            onClick={handleMigrate}
            className="text-xs text-primary hover:underline font-medium"
          >
            Migrate to Tomorrow
          </button>
       </div>

       <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
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

       <div className="space-y-2">
         {initialTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-white/10 rounded-2xl">
               No tasks for today.
            </div>
         )}
         {initialTasks.map(task => (
           <div key={task.id} className="group flex items-center gap-3 p-3 hover:bg-white/60 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/40 dark:hover:border-white/10 shadow-sm hover:shadow-md mb-2 bg-white/30 dark:bg-white/5">
              <button 
                onClick={async () => {
                  const res = await toggleTask(task.id) as any;
                  if (res && res.success && res.isCompleting) {
                    if (res.newBadges && res.newBadges.length > 0) {
                      import("@/lib/confetti").then(m => m.fireBadgeConfetti());
                      alert(`🎉 You unlocked ${res.newBadges.length} new badge(s)!`);
                    } else if (res.expGained) {
                      import("@/lib/confetti").then(m => m.fireConfetti());
                    }
                  }
                }}
                className={cn("text-muted-foreground hover:text-primary transition-colors h-10 w-10 flex items-center justify-center shrink-0", task.completed && "text-emerald-500")}
              >
                {task.completed ? <CheckCircle2 size={24} className="fill-emerald-50/10" /> : <Circle size={24} />}
              </button>
              <span className={cn("flex-1 text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 size={16} />
              </button>
           </div>
         ))}
       </div>
    </div>
  );
}
