"use server";

import { Subscription, BillingCycle } from "@/types";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWallets, getCategories, addCategory, addTransaction, deleteTransaction } from "./finance";
import { getSettings } from "./settings";

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// Helpers
function mapSubscription(sub: any): Subscription {
  return {
    ...sub,
    price: sub.price.toNumber(),
    cycle: sub.cycle.toLowerCase() as BillingCycle,
    nextBillingDate: sub.nextBillingDate ? sub.nextBillingDate.toISOString() : undefined,
    lastPaidDate: sub.lastPaidDate ? sub.lastPaidDate.toISOString() : null,
  };
}

export async function getSubscriptions(): Promise<Subscription[]> {
  try {
    const userId = await getCurrentUser();
    const subs = await prisma.subscription.findMany({
      where: { userId }
    });
    return subs.map(mapSubscription);
  } catch (error) {
    console.error("getSubscriptions error:", error);
    return [];
  }
}

export async function addSubscription(data: Omit<Subscription, "id" | "userId">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.subscription.create({
      data: {
        name: data.name,
        price: data.price,
        cycle: data.cycle.toUpperCase() as any,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
        lastPaidDate: data.lastPaidDate ? new Date(data.lastPaidDate) : undefined,
        lastTransactionId: data.lastTransactionId,
        url: data.url,
        note: data.note,
        user: { connect: { id: userId } }
      }
    });
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
    await prisma.subscription.update({
      where: { id, userId },
      data: {
        name: data.name,
        price: data.price,
        cycle: data.cycle ? data.cycle.toUpperCase() as any : undefined,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
        lastPaidDate: data.lastPaidDate ? new Date(data.lastPaidDate) : undefined,
        lastTransactionId: data.lastTransactionId,
        url: data.url,
        note: data.note,
      }
    });

    revalidatePath("/finance");
    revalidatePath("/subscriptions");
    return true;
  } catch (error) {
    console.error("Update subscription error:", error);
    return false;
  }
}

export async function deleteSubscription(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.subscription.delete({
      where: { id, userId }
    });
    revalidatePath("/finance");
    revalidatePath("/subscriptions");
    return true;
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
    const sub = await prisma.subscription.findUnique({ where: { id: subId, userId }});
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
      amount: sub.price.toNumber(),
      type: "expense",
      categoryId: subCategory.id,
      walletId: targetWalletId,
      note: `Subscription: ${sub.name}`,
    });

    if (!txResult.success) {
      return { success: false, error: "Failed to create transaction" };
    }

    await prisma.subscription.update({
      where: { id: sub.id, userId },
      data: {
        lastPaidDate: new Date(),
        lastTransactionId: txResult.transactionId
      }
    });

    revalidatePath("/finance");
    revalidatePath("/subscriptions");

    return { success: true };
  } catch (err) {
    console.error("markSubscriptionAsPaid error:", err);
    return { success: false, error: "Internal server error" };
  }
}

export async function unmarkSubscriptionAsPaid(subId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUser();
    const sub = await prisma.subscription.findUnique({ where: { id: subId, userId }});
    if (!sub) return { success: false, error: "Subscription not found" };

    if (sub.lastTransactionId) {
      await deleteTransaction(sub.lastTransactionId);
    }

    await prisma.subscription.update({
      where: { id: sub.id, userId },
      data: {
        lastPaidDate: null,
        lastTransactionId: null
      }
    });
    
    revalidatePath("/finance");
    revalidatePath("/subscriptions");

    return { success: true };
  } catch (err) {
    console.error("unmarkSubscriptionAsPaid error:", err);
    return { success: false, error: "Internal server error" };
  }
}
