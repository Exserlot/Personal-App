"use client";

import { useState } from "react";
import { Task } from "@/types";
import { addTask, toggleTask, deleteTask, migrateIncompleteTasks } from "@/lib/actions/productivity";
import { Plus, Trash2, CalendarDays, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    await addTask(newTask, date);
    setNewTask("");
    setLoading(false);
  }

  async function handleMigrate() {
     if(!confirm("Move incomplete tasks to tomorrow?")) return;
     await migrateIncompleteTasks(date);
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4">
       <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
             <CalendarDays size={14} />
             {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <button 
            onClick={handleMigrate}
            className="text-xs text-primary hover:underline"
          >
            Migrate to Tomorrow
          </button>
       </div>

       <form onSubmit={handleAdd} className="flex gap-2 mb-4">
         <input
           type="text"
           value={newTask}
           onChange={(e) => setNewTask(e.target.value)}
           placeholder="Add a new task..."
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

       <div className="space-y-2">
         {initialTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
               No tasks for today.
            </div>
         )}
         {initialTasks.map(task => (
           <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <button 
                onClick={() => toggleTask(task.id)}
                className={cn("text-muted-foreground hover:text-primary transition-colors", task.completed && "text-emerald-500")}
              >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <span className={cn("flex-1 text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-rose-600 transition-all"
              >
                <Trash2 size={14} />
              </button>
           </div>
         ))}
       </div>
    </div>
  );
}
