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

// Map common symbols to CoinGecko IDs
const CRYPTO_MAP: Record<string, string> = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'ada': 'cardano',
  'xrp': 'ripple',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'link': 'chainlink',
  'matic': 'matic-network'
};

export async function syncInvestmentPrices(): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getCurrentUser();
    const investments = await prisma.investmentAsset.findMany({
      where: { userId, type: "CRYPTO" }
    });

    if (investments.length === 0) {
      return { success: true, message: "No crypto investments to sync." };
    }

    // Collect ids to fetch
    const fetchIds: string[] = [];
    const invMap: Record<string, any[]> = {}; // Map coingecko id to investment records

    investments.forEach(inv => {
      // Clean up name, assume user might input "BTC", "Bitcoin", "ETH", etc.
      let key = inv.name.toLowerCase().trim();
      let cgId = CRYPTO_MAP[key] || key; // If not in map, try using the name directly
      
      if (!fetchIds.includes(cgId)) fetchIds.push(cgId);
      
      if (!invMap[cgId]) invMap[cgId] = [];
      invMap[cgId].push(inv);
    });

    // Fetch from CoinGecko
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fetchIds.join(',')}&vs_currencies=thb`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data = await response.json();
    let updatedCount = 0;

    // Update prices in DB
    await prisma.$transaction(async (tx) => {
      for (const cgId of Object.keys(data)) {
        const thbPrice = data[cgId].thb;
        if (thbPrice && invMap[cgId]) {
          for (const inv of invMap[cgId]) {
            // Assume amountInvested or a note holds the 'quantity' of the coin.
            // But since our schema only has `amountInvested` (Fiat) and `currentValue` (Fiat),
            // we need to know the QUANTITY to multiply by the new price.
            // If the user stored quantity in `note`, we could parse it.
            // As a simple heuristic for Phase 2, let's parse quantity from `note` (e.g., "0.5")
            // If `note` is not a number, we can't update it accurately.
            const quantity = parseFloat(inv.note || "0");
            
            if (quantity > 0) {
              const newCurrentValue = quantity * thbPrice;
              await tx.investmentAsset.update({
                where: { id: inv.id },
                data: { currentValue: newCurrentValue }
              });
              updatedCount++;
            }
          }
        }
      }
    });

    revalidatePath("/finance");
    return { success: true, message: `Successfully updated ${updatedCount} investment prices.` };
  } catch (error) {
    console.error("Sync investment prices error:", error);
    return { success: false, message: "Failed to sync live prices." };
  }
}
