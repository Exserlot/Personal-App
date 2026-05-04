"use client";

import { useState, useEffect } from "react";
import { YearlyGoal, GoalStatus } from "@/types";
import { AddGoalModal } from "./add-goal-modal";
import { EditGoalModal } from "./edit-goal-modal";
import { Plus, Target, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { updateGoal } from "@/lib/actions/goals";
import { useRouter } from "next/navigation";

interface GoalDashboardProps {
  goals: YearlyGoal[];
  userId: string;
}

const COLUMNS: { id: GoalStatus; title: string; icon: React.ReactNode }[] = [
  {
    id: "not_started",
    title: "Not Started",
    icon: <Circle className="text-stone-400" size={18} />,
  },
  {
    id: "in_progress",
    title: "In Progress",
    icon: <Clock className="text-amber-500" size={18} />,
  },
  {
    id: "done",
    title: "Done",
    icon: <CheckCircle2 className="text-emerald-500" size={18} />,
  },
];

export function GoalDashboard({ goals, userId }: GoalDashboardProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<YearlyGoal | null>(null);

  // Local state for optimistic updates
  const [localGoals, setLocalGoals] = useState<YearlyGoal[]>(goals);

  // To avoid hydration mismatch with react-beautiful-dnd
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  // Group by year, reverse sorted
  const years = Array.from(new Set(localGoals.map((g) => g.year))).sort(
    (a, b) => b - a,
  );
  if (years.length === 0) {
    years.push(new Date().getFullYear());
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Check if moved to a different column
    if (source.droppableId !== destination.droppableId) {
      const sourceColId = source.droppableId.split("-")[1] as GoalStatus;
      const destColId = destination.droppableId.split("-")[1] as GoalStatus;

      // Optimistic update
      setLocalGoals((prev) =>
        prev.map((g) =>
          g.id === draggableId ? { ...g, status: destColId } : g,
        ),
      );

      // Persist to DB
      const success = await updateGoal(draggableId, { status: destColId });
      if (!success) {
        // Revert on failure
        setLocalGoals(goals);
        alert("Failed to update goal status.");
      } else {
        router.refresh();
      }
    }
  };

  if (!isMounted) return null;

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

      <DragDropContext onDragEnd={handleDragEnd}>
        {years.map((year) => {
          const yearGoals = localGoals.filter((g) => g.year === year);

          return (
            <div key={year} className="space-y-4">
              <h3 className="text-xl font-extrabold text-stone-800 dark:text-stone-200">
                {year}
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {COLUMNS.map((col) => {
                  const columnGoals = yearGoals.filter(
                    (g) => g.status === col.id,
                  );
                  const droppableId = `${year}-${col.id}`;

                  return (
                    <div
                      key={droppableId}
                      className="flex flex-col bg-white/20 dark:bg-stone-900/20 border border-white/40 dark:border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-lg"
                    >
                      {/* Column Header */}
                      <div className="flex items-center gap-2 mb-4 px-2 font-bold">
                        {col.icon}
                        <span>{col.title}</span>
                        <span className="ml-auto bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {columnGoals.length}
                        </span>
                      </div>

                      {/* Droppable Area */}
                      <Droppable droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "flex-1 min-h-[150px] transition-colors rounded-2xl p-2",
                              snapshot.isDraggingOver &&
                                "bg-white/30 dark:bg-white/5",
                            )}
                          >
                            {columnGoals.map((goal, index) => (
                              <Draggable
                                key={goal.id}
                                draggableId={goal.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => setEditingGoal(goal)}
                                    className={cn(
                                      "mb-3 p-5 rounded-2xl border bg-white/60 dark:bg-stone-800/60 backdrop-blur-md cursor-grab active:cursor-grabbing hover:shadow-md transition-all group",
                                      snapshot.isDragging
                                        ? "shadow-2xl border-primary/50 rotate-2 scale-105"
                                        : "border-white/50 dark:border-white/10 hover:-translate-y-1",
                                      goal.status === "done" &&
                                        "opacity-80 bg-emerald-50/40 dark:bg-emerald-900/20",
                                    )}
                                    style={provided.draggableProps.style}
                                  >
                                    <h4
                                      className={cn(
                                        "font-bold text-sm leading-snug group-hover:text-primary transition-colors",
                                        goal.status === "done" &&
                                          "line-through text-muted-foreground",
                                      )}
                                    >
                                      {goal.title}
                                    </h4>
                                    {goal.description && (
                                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {goal.description}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </DragDropContext>

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
