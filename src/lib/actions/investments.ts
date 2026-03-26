"use server";

import { InvestmentAsset } from "@/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { Repository } from "@/lib/repository";

// Repositories
const investmentRepo = new Repository<InvestmentAsset>("investment_portfolio.json");

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getInvestments(): Promise<InvestmentAsset[]> {
  try {
    const userId = await getCurrentUser();
    return await investmentRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function addInvestment(data: Omit<InvestmentAsset, "id" | "userId" | "updatedAt">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const newInvestment: InvestmentAsset = {
      ...data,
      id: randomUUID(),
      userId,
      updatedAt: new Date().toISOString(),
    };
    await investmentRepo.add(newInvestment);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("Add investment error:", error);
    return false;
  }
}

export async function updateInvestment(id: string, data: Partial<Omit<InvestmentAsset, "id" | "userId" | "updatedAt">>): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const updates = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const result = await investmentRepo.update(id, userId, updates);
    if (result) revalidatePath("/finance");
    return result;
  } catch (error) {
    console.error("Update investment error:", error);
    return false;
  }
}

export async function deleteInvestment(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const result = await investmentRepo.delete(id, userId);
    if (result) revalidatePath("/finance");
    return result;
  } catch (error) {
    console.error("Delete investment error:", error);
    return false;
  }
}

export async function getInvestmentSummary(): Promise<{ totalInvested: number; totalCurrentValue: number; profitLoss: number; profitLossPercentage: number }> {
  try {
    const investments = await getInvestments();
    
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    investments.forEach((inv) => {
      totalInvested += inv.amountInvested;
      totalCurrentValue += inv.currentValue;
    });

    const profitLoss = totalCurrentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      profitLoss,
      profitLossPercentage,
    };
  } catch {
    return {
      totalInvested: 0,
      totalCurrentValue: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
    };
  }
}
