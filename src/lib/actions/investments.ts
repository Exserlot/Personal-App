"use server";

import { InvestmentAsset, InvestmentType } from "@/types";
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

function mapInvestment(inv: any): InvestmentAsset {
  return {
    ...inv,
    type: inv.type.toLowerCase() as InvestmentType,
    amountInvested: inv.amountInvested.toNumber(),
    currentValue: inv.currentValue.toNumber(),
    updatedAt: inv.updatedAt.toISOString()
  };
}

export async function getInvestments(): Promise<InvestmentAsset[]> {
  try {
    const userId = await getCurrentUser();
    const invs = await prisma.investmentAsset.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
    return invs.map(mapInvestment);
  } catch (error) {
    console.error("getInvestments error:", error);
    return [];
  }
}

export async function addInvestment(data: Omit<InvestmentAsset, "id" | "userId" | "updatedAt">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.investmentAsset.create({
      data: {
        name: data.name,
        type: data.type.toUpperCase() as any,
        amountInvested: data.amountInvested,
        currentValue: data.currentValue,
        note: data.note,
        user: { connect: { id: userId } }
      }
    });

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
    await prisma.investmentAsset.update({
      where: { id, userId },
      data: {
        name: data.name,
        type: data.type ? data.type.toUpperCase() as any : undefined,
        amountInvested: data.amountInvested,
        currentValue: data.currentValue,
        note: data.note,
      }
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("Update investment error:", error);
    return false;
  }
}

export async function deleteInvestment(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.investmentAsset.delete({
      where: { id, userId }
    });

    revalidatePath("/finance");
    return true;
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
  } catch (error) {
    console.error("getInvestmentSummary error:", error);
    return {
      totalInvested: 0,
      totalCurrentValue: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
    };
  }
}
