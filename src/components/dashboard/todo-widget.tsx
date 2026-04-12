"use client";

import { Task } from "@/types";
import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface TodoWidgetProps {
  tasks: Task[];
}

export function TodoWidget({ tasks }: TodoWidgetProps) {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Today's Tasks</h3>
            <p className="text-xs text-muted-foreground">{completedCount} of {totalCount} completed</p>
          </div>
        </div>
        <Link 
          href="/productivity"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tasks for today</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-4 mb-2 rounded-2xl bg-white/50 dark:bg-stone-700/30 hover:bg-white/80 dark:hover:bg-stone-700/60 hover:shadow-md transition-all border border-transparent hover:border-white/50">
              <div className={`shrink-0 ${task.completed ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <p className={`text-sm font-medium flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.priority === 'high' && !task.completed && (
                <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
