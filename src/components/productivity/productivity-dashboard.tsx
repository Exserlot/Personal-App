"use client";

import { Task, Habit } from "@/types";
import { TodoList } from "./todo-list";
import { HabitTracker } from "./habit-tracker";
import { useState } from "react";
import { CheckSquare, Activity } from "lucide-react";

interface ProductivityDashboardProps {
  tasks: Task[];
  habits: Habit[];
  today: string;
}

export function ProductivityDashboard({ tasks, habits, today }: ProductivityDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Productivity</h2>
         <p className="text-muted-foreground">Manage your daily tasks and habits.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: To-Do List */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <CheckSquare />
              <h3>Daily Tasks</h3>
           </div>
           <TodoList initialTasks={tasks} date={today} />
        </div>

        {/* Right: Habit Tracker */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <Activity />
              <h3>Habits</h3>
           </div>
           <HabitTracker initialHabits={habits} date={today} />
        </div>
      </div>
    </div>
  );
}
