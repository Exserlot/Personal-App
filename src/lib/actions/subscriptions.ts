"use server";

import { Subscription } from "@/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { Repository } from "@/lib/repository";
import { getWallets, getCategories, addCategory, addTransaction, deleteTransaction } from "./finance";
import { getSettings } from "./settings";

// Repositories
const subscriptionRepo = new Repository<Subscription>("subscriptions.json");

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  try {
    const userId = await getCurrentUser();
    return await subscriptionRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function addSubscription(data: Omit<Subscription, "id" | "userId">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const newSubscription: Subscription = {
      ...data,
      id: randomUUID(),
      userId,
    };
    await subscriptionRepo.add(newSubscription);
    revalidatePath("/finance");
    revalidatePath("/subscriptions");
    return true;
  } catch (error) {
    console.error("Add subscription error:", error);
    return false;
  }
}

export async function updateSubscription(id: string, data: Partial<Omit<Subscription, "id" | "userId">>): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const result = await subscriptionRepo.update(id, userId, data);
    if (result) {
      revalidatePath("/finance");
      revalidatePath("/subscriptions");
    }
    return result;
  } catch (error) {
    console.error("Update subscription error:", error);
    return false;
  }
}

export async function deleteSubscription(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const result = await subscriptionRepo.delete(id, userId);
    if (result) {
      revalidatePath("/finance");
      revalidatePath("/subscriptions");
    }
    return result;
  } catch (error) {
    console.error("Delete subscription error:", error);
    return false;
  }
}

export async function getYearlySubscriptionCost(): Promise<{ dailyTotal: number; monthlyTotal: number; yearlyTotal: number; totalFixedYearlyCost: number }> {
  try {
    const subscriptions = await getSubscriptions();
    
    let dailyTotal = 0;
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    subscriptions.forEach(sub => {
      if (sub.cycle === "daily") {
        dailyTotal += sub.price;
      } else if (sub.cycle === "monthly") {
        monthlyTotal += sub.price;
      } else if (sub.cycle === "yearly") {
        yearlyTotal += sub.price;
      }
    });

    const totalFixedYearlyCost = (dailyTotal * 365) + (monthlyTotal * 12) + yearlyTotal;

    return {
      dailyTotal,
      monthlyTotal,
      yearlyTotal,
      totalFixedYearlyCost
    };
  } catch {
    return {
      dailyTotal: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      totalFixedYearlyCost: 0
    };
  }
}

export async function markSubscriptionAsPaid(subId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUser();
    const sub = await subscriptionRepo.findById(subId, userId);
    if (!sub) return { success: false, error: "Subscription not found" };

    const wallets = await getWallets();
    if (wallets.length === 0) {
      return { success: false, error: "No wallet found. Please create a wallet in Finance first." };
    }

    const categories = await getCategories();
    let subCategory = categories.find(c => c.name.toLowerCase() === "subscription" && c.type === "expense");

    if (!subCategory) {
      await addCategory("Subscription", "expense", "#8B5CF6", "repeat");
      const updatedCategories = await getCategories();
      subCategory = updatedCategories.find(c => c.name.toLowerCase() === "subscription" && c.type === "expense");
      
      if (!subCategory) {
        return { success: false, error: "Failed to create Subscription category" };
      }
    }

    const settings = await getSettings(userId);
    const targetWalletId = settings.defaultWalletId || wallets[0].id;

    const txResult = await addTransaction({
      date: new Date().toISOString(),
      amount: sub.price,
      type: "expense",
      categoryId: subCategory.id,
      walletId: targetWalletId,
      note: `Subscription: ${sub.name}`,
    });

    if (!txResult.success) {
      return { success: false, error: "Failed to create transaction" };
    }

    const updated = await subscriptionRepo.update(sub.id, userId, { 
      lastPaidDate: new Date().toISOString(),
      lastTransactionId: txResult.transactionId
    });
    if (updated) {
      revalidatePath("/finance");
      revalidatePath("/subscriptions");
    }

    return { success: true };
  } catch (err) {
    console.error("markSubscriptionAsPaid error:", err);
    return { success: false, error: "Internal server error" };
  }
}

export async function unmarkSubscriptionAsPaid(subId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUser();
    const sub = await subscriptionRepo.findById(subId, userId);
    if (!sub) return { success: false, error: "Subscription not found" };

    if (sub.lastTransactionId) {
      await deleteTransaction(sub.lastTransactionId);
    }

    const updated = await subscriptionRepo.update(sub.id, userId, { 
      lastPaidDate: null,
      lastTransactionId: null
    });
    
    if (updated) {
      revalidatePath("/finance");
      revalidatePath("/subscriptions");
    }

    return { success: true };
  } catch (err) {
    console.error("unmarkSubscriptionAsPaid error:", err);
    return { success: false, error: "Internal server error" };
  }
}
