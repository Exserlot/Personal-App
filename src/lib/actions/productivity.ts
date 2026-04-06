"use server";

import { Task, Habit, TaskPriority } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --- Helpers ---
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function mapTask(t: any): Task {
  return {
    ...t,
    date: t.date, // Prisma schema defines date as a String (YYYY-MM-DD)
    priority: t.priority.toLowerCase() as TaskPriority
  };
}

// --- Tasks ---
export async function getTasks(date: string): Promise<Task[]> {
  try {
    const userId = await getCurrentUser();
    
    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        date: date
      }
    });

    return tasks.map(mapTask);
  } catch (error) {
    console.error("getTasks error:", error);
    return [];
  }
}

export async function addTask(title: string, date: string, priority: "low"|"medium"|"high" = "medium") {
  try {
    const userId = await getCurrentUser();
    await prisma.task.create({
      data: {
        title,
        date: date, // Passed as exact string YYYY-MM-DD to match schema layout
        priority: priority.toUpperCase() as any,
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/productivity");
    return { success: true };
  } catch (error) {
    console.error("addTask error:", error);
    return { success: false };
  }
}

export async function toggleTask(id: string) {
  try {
    const userId = await getCurrentUser();
    const task = await prisma.task.findUnique({ where: { id, userId } });
    
    if (task) {
      await prisma.task.update({
        where: { id },
        data: { completed: !task.completed }
      });
      revalidatePath("/productivity");
    }
  } catch (error) {
    console.error("toggleTask error:", error);
  }
}

export async function deleteTask(id: string) {
  try {
    const userId = await getCurrentUser();
    await prisma.task.delete({
      where: { id, userId }
    });
    revalidatePath("/productivity");
  } catch (error) {
    console.error("deleteTask error:", error);
  }
}

export async function migrateIncompleteTasks(currentDate: string) {
  try {
    const userId = await getCurrentUser();
    
    // Calculate the next date as "YYYY-MM-DD" string
    const nextDT = new Date(currentDate);
    nextDT.setDate(nextDT.getDate() + 1);
    const nextDateStr = nextDT.toISOString().split('T')[0];

    const updated = await prisma.task.updateMany({
      where: {
        userId,
        date: currentDate,
        completed: false
      },
      data: {
        date: nextDateStr
      }
    });

    if (updated.count > 0) {
      revalidatePath("/productivity");
    }
  } catch (error) {
    console.error("migrateIncompleteTasks error:", error);
  }
}

// --- Habits ---
export async function getHabits(): Promise<Habit[]> {
  try {
    const userId = await getCurrentUser();
    const habits = await prisma.habit.findMany({
      where: { userId }
    });
    return habits as Habit[];
  } catch (error) {
    console.error("getHabits error:", error);
    return [];
  }
}

export async function addHabit(name: string) {
  try {
    const userId = await getCurrentUser();
    await prisma.habit.create({
      data: {
        name,
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/productivity");
    return { success: true };
  } catch (error) {
    console.error("addHabit error:", error);
    return { success: false };
  }
}

export async function toggleHabit(id: string, date: string) {
  try {
    const userId = await getCurrentUser();
    const habit = await prisma.habit.findUnique({ where: { id, userId } });
    
    if (habit) {
      const dates = [...habit.completedDates];
      const index = dates.indexOf(date);
      
      if (index > -1) {
        dates.splice(index, 1);
      } else {
        dates.push(date);
      }

      await prisma.habit.update({
        where: { id },
        data: {
          completedDates: dates
        }
      });
      revalidatePath("/productivity");
    }
  } catch (error) {
    console.error("toggleHabit error:", error);
  }
}

export async function deleteHabit(id: string) {
  try {
    const userId = await getCurrentUser();
    await prisma.habit.delete({
      where: { id, userId }
    });
    revalidatePath("/productivity");
  } catch (error) {
    console.error("deleteHabit error:", error);
  }
}
