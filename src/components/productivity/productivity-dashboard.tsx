"use client";

import { Task, Habit } from "@/types";
import { TodoList } from "./todo-list";
import { HabitTracker } from "./habit-tracker";
import { useState } from "react";
import { CheckSquare, Activity } from "lucide-react";

import { GamificationWidget } from "../gamification/gamification-widget";

interface ProductivityDashboardProps {
  tasks: Task[];
  habits: Habit[];
  today: string;
  stats: any;
}

export function ProductivityDashboard({ tasks, habits, today, stats }: ProductivityDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Activity className="text-primary" />
          Productivity
        </h1>
        <p className="text-muted-foreground mt-1">Manage your daily tasks and habits.</p>
      </div>

      {stats && <GamificationWidget stats={stats} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: To-Do List */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-primary font-bold px-2">
              <CheckSquare size={20} />
              <h3 className="text-lg">Daily Tasks</h3>
           </div>
           <TodoList initialTasks={tasks} date={today} />
        </div>

        {/* Right: Habit Tracker */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-primary font-bold px-2">
              <Activity size={20} />
              <h3 className="text-lg">Habits</h3>
           </div>
           <HabitTracker initialHabits={habits} date={today} />
        </div>
      </div>
    </div>
  );
}
