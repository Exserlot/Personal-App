"use server";

import { YearlyGoal, GoalStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function mapGoal(g: any): YearlyGoal {
  return {
    ...g,
    status: g.status.toLowerCase() as GoalStatus,
    createdAt: g.createdAt.toISOString()
  };
}

export async function getGoals(): Promise<YearlyGoal[]> {
  try {
    const userId = await getCurrentUser();
    const goals = await prisma.yearlyGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return goals.map(mapGoal);
  } catch (error) {
    console.error("getGoals error:", error);
    return [];
  }
}

export async function getGoalsByYear(year: number): Promise<YearlyGoal[]> {
  try {
    const userId = await getCurrentUser();
    const goals = await prisma.yearlyGoal.findMany({
      where: { userId, year },
      orderBy: { createdAt: "desc" }
    });
    return goals.map(mapGoal);
  } catch (error) {
    console.error("getGoalsByYear error:", error);
    return [];
  }
}

export async function addGoal(data: Omit<YearlyGoal, "id" | "userId" | "createdAt" | "status">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.yearlyGoal.create({
      data: {
        title: data.title,
        year: data.year,
        description: data.description,
        status: "NOT_STARTED",
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/productivity");
    return true;
  } catch (error) {
    console.error("Add goal error:", error);
    return false;
  }
}

export async function updateGoal(id: string, data: Partial<Omit<YearlyGoal, "id" | "userId" | "createdAt">>): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.yearlyGoal.update({
      where: { id, userId },
      data: {
        title: data.title,
        year: data.year,
        description: data.description,
        status: data.status ? data.status.toUpperCase() as any : undefined
      }
    });
    
    revalidatePath("/productivity");
    return true;
  } catch (error) {
    console.error("Update goal error:", error);
    return false;
  }
}

export async function deleteGoal(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.yearlyGoal.delete({
      where: { id, userId }
    });
    
    revalidatePath("/productivity");
    return true;
  } catch (error) {
    console.error("Delete goal error:", error);
    return false;
  }
}
