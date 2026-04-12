"use client";

import { useState } from "react";
import { YearlyGoal } from "@/types";
import { AddGoalModal } from "./add-goal-modal";
import { EditGoalModal } from "./edit-goal-modal";
import { Plus, Target, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalDashboardProps {
  goals: YearlyGoal[];
  userId: string;
}

export function GoalDashboard({ goals, userId }: GoalDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<YearlyGoal | null>(null);
  
  // Group by year, reverse sorted
  const years = Array.from(new Set(goals.map(g => g.year))).sort((a, b) => b - a);

  // Fallback to current year if no goals
  if (years.length === 0) {
    years.push(new Date().getFullYear());
  }

  function getStatusIcon(status: YearlyGoal["status"]) {
    switch (status) {
      case "done": return <CheckCircle2 className="text-emerald-500 shrink-0" />;
      case "in_progress": return <Clock className="text-amber-500 shrink-0" />;
      case "not_started":
      default: return <Circle className="text-stone-300 shrink-0" />;
    }
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="text-primary" />
            Yearly Goals
          </h2>
          <p className="text-muted-foreground">Track your big achievements.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Add Goal
        </button>
      </div>

      {/* Goal Lists by Year */}
      <div className="space-y-8">
        {years.map(year => {
          const yearGoals = goals.filter(g => g.year === year);
          
          return (
            <div key={year} className="space-y-4">
              <h3 className="text-xl font-extrabold text-stone-800 dark:text-stone-200">{year}</h3>
              
              {yearGoals.length === 0 ? (
                <div 
                  onClick={() => setShowAddModal(true)}
                  className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/40 dark:border-white/10 rounded-3xl p-8 text-muted-foreground hover:border-white/80 dark:hover:border-white/30 bg-white/20 dark:bg-stone-800/20 backdrop-blur-xl hover:bg-white/40 dark:hover:bg-stone-800/40 hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer duration-300"
                >
                   <Target size={32} className="mb-2 opacity-30" />
                   <span className="font-medium text-lg">No Goals for {year}</span>
                   <span className="text-sm opacity-70">Click to start planning</span>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {yearGoals.map(goal => (
                    <div 
                      key={goal.id}
                      onClick={() => setEditingGoal(goal)}
                      className={cn(
                        "flex items-center gap-4 p-6 rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-white/60 dark:hover:border-white/20 transition-all duration-300 group",
                        goal.status === "done" && "opacity-80 bg-emerald-50/30 dark:bg-emerald-950/20 mix-blend-luminosity"
                      )}
                    >
                      <div className="mt-0.5 transition-transform group-hover:scale-110">
                        {getStatusIcon(goal.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={cn(
                          "font-bold text-base leading-tight group-hover:text-primary transition-colors",
                          goal.status === "done" && "line-through text-muted-foreground"
                        )}>
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAB for Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center sm:hidden hover:scale-110 active:scale-90 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <AddGoalModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        userId={userId}
      />

      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          isOpen={true}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
}
