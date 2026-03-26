"use server";

import { YearlyGoal, GoalStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { Repository } from "@/lib/repository";

// Repositories
const goalRepo = new Repository<YearlyGoal>("goals.json");

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getGoals(): Promise<YearlyGoal[]> {
  try {
    const userId = await getCurrentUser();
    return await goalRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function getGoalsByYear(year: number): Promise<YearlyGoal[]> {
  try {
    const userId = await getCurrentUser();
    const goals = await goalRepo.getByUserId(userId);
    return goals.filter(g => g.year === year);
  } catch {
    return [];
  }
}

export async function addGoal(data: Omit<YearlyGoal, "id" | "userId" | "createdAt" | "status">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const newGoal: YearlyGoal = {
      ...data,
      id: randomUUID(),
      status: "not_started" as GoalStatus,
      userId,
      createdAt: new Date().toISOString(),
    };
    await goalRepo.add(newGoal);
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
    const result = await goalRepo.update(id, userId, data);
    if (result) revalidatePath("/productivity");
    return result;
  } catch (error) {
    console.error("Update goal error:", error);
    return false;
  }
}

export async function deleteGoal(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const result = await goalRepo.delete(id, userId);
    if (result) revalidatePath("/productivity");
    return result;
  } catch (error) {
    console.error("Delete goal error:", error);
    return false;
  }
}
