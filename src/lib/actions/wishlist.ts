"use server";

import { WishlistItem, WishlistPriority, WishlistStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { getCategories, addCategory, addTransaction, deleteTransaction } from "./finance";
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

// Helpers
function mapWishlistItem(item: any): WishlistItem {
  return {
    ...item,
    price: item.price.toNumber(),
    priority: item.priority.toLowerCase() as WishlistPriority,
    status: item.status.toLowerCase() as WishlistStatus,
    createdAt: item.createdAt.toISOString()
  };
}

export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const userId = await getCurrentUser();
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return items.map(mapWishlistItem);
  } catch (error) {
    console.error("getWishlist error:", error);
    return [];
  }
}

export async function addWishlistItem(item: Omit<WishlistItem, "id" | "createdAt" | "status">) {
  try {
    const userId = await getCurrentUser();
    await prisma.wishlistItem.create({
      data: {
        name: item.name,
        price: item.price,
        priority: item.priority.toUpperCase() as any,
        url: item.url,
        image: item.image,
        note: item.note,
        user: { connect: { id: userId } }
      }
    });
    
    revalidatePath("/productivity");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("addWishlistItem error:", error);
    return { success: false, error: "Failed to add wishlist item" };
  }
}

export async function updateWishlistItem(id: string, updates: Partial<WishlistItem>) {
  try {
    const userId = await getCurrentUser();
    await prisma.wishlistItem.update({
      where: { id, userId },
      data: {
        name: updates.name,
        price: updates.price,
        priority: updates.priority ? updates.priority.toUpperCase() as any : undefined,
        status: updates.status ? updates.status.toUpperCase() as any : undefined,
        url: updates.url,
        image: updates.image,
        note: updates.note,
        lastTransactionId: updates.lastTransactionId
      }
    });

    revalidatePath("/productivity");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("updateWishlistItem error:", error);
    return { success: false, error: "Failed to update wishlist item" };
  }
}

export async function deleteWishlistItem(id: string) {
  try {
    const userId = await getCurrentUser();
    await prisma.wishlistItem.delete({
      where: { id, userId }
    });

    revalidatePath("/productivity");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("deleteWishlistItem error:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function markAsBought(id: string, walletId?: string) {
  try {
    const userId = await getCurrentUser();
    const item = await prisma.wishlistItem.findUnique({ where: { id, userId } });
    if (!item) return { success: false, error: "Item not found" };

    let transactionId = null;

    if (walletId) {
      // 1. Ensure "Wishlist" category exists
      const categories = await getCategories();
      let wlCategory = categories.find(c => c.name.toLowerCase() === "wishlist" && c.type === "expense");
      
      if (!wlCategory) {
        await addCategory("Wishlist", "expense", "#10B981", "shopping"); // emerald-500, shopping bag
        const updatedCategories = await getCategories();
        wlCategory = updatedCategories.find(c => c.name.toLowerCase() === "wishlist" && c.type === "expense");
      }

      if (wlCategory) {
        // 2. Add transaction
        const txResult = await addTransaction({
          date: new Date().toISOString(),
          amount: item.price.toNumber(),
          type: "expense",
          categoryId: wlCategory.id,
          walletId: walletId,
          note: `Wishlist: ${item.name}`,
        });

        if (txResult.success && txResult.transactionId) {
          transactionId = txResult.transactionId;
        }
      }
    }

    await prisma.wishlistItem.update({
      where: { id },
      data: {
        status: "BOUGHT",
        lastTransactionId: transactionId
      }
    });
    
    revalidatePath("/productivity");
    revalidatePath("/finance");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("markAsBought error:", error);
    return { success: false, error: "Internal Error" };
  }
}

export async function restoreFromBought(id: string) {
  try {
    const userId = await getCurrentUser();
    const item = await prisma.wishlistItem.findUnique({ where: { id, userId } });
    if (!item) return { success: false, error: "Item not found" };

    if (item.lastTransactionId) {
      await deleteTransaction(item.lastTransactionId);
    }

    await prisma.wishlistItem.update({
      where: { id },
      data: {
        status: "ACTIVE",
        lastTransactionId: null
      }
    });
    
    revalidatePath("/productivity");
    revalidatePath("/finance");
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("restoreFromBought error:", error);
    return { success: false, error: "Internal Error" };
  }
}
