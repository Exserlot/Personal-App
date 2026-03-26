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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
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
