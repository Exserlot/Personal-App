"use server";

import fs from "fs/promises";
import path from "path";
import { WishlistItem } from "@/types";
import { revalidatePath } from "next/cache";
import { getCategories, addCategory, addTransaction, deleteTransaction, getWallets } from "./finance";

const DATA_DIR = path.join(process.cwd(), "..", "data");
const FILE_PATH = path.join(DATA_DIR, "wishlist.json");

// Helper to ensure file exists
async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE_PATH, "[]", "utf-8");
  }
}

// Helper to read data
async function readData(): Promise<WishlistItem[]> {
  await ensureFile();
  const data = await fs.readFile(FILE_PATH, "utf-8");
  return JSON.parse(data);
}

// Helper to write data
async function writeData(data: WishlistItem[]) {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getWishlist(): Promise<WishlistItem[]> {
  return await readData();
}

export async function addWishlistItem(item: Omit<WishlistItem, "id" | "createdAt" | "status">) {
  const items = await readData();
  const newItem: WishlistItem = {
    ...item,
    id: crypto.randomUUID(),
    status: "active",
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  await writeData(items);
  revalidatePath("/productivity");
  return { success: true };
}

export async function updateWishlistItem(id: string, updates: Partial<WishlistItem>) {
  const items = await readData();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return { success: false, error: "Item not found" };

  items[index] = { ...items[index], ...updates };
  await writeData(items);
  revalidatePath("/productivity");
  return { success: true };
}

export async function deleteWishlistItem(id: string) {
  const items = await readData();
  const filtered = items.filter(i => i.id !== id);
  await writeData(filtered);
  revalidatePath("/productivity");
  return { success: true };
}

export async function markAsBought(id: string, walletId?: string) {
  const items = await readData();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return { success: false, error: "Item not found" };

  const item = items[index];
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
        amount: item.price,
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

  items[index] = { 
    ...item, 
    status: "bought",
    lastTransactionId: transactionId
  };
  
  await writeData(items);
  revalidatePath("/productivity");
  revalidatePath("/finance");
  revalidatePath("/wishlist");
  return { success: true };
}

export async function restoreFromBought(id: string) {
  const items = await readData();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return { success: false, error: "Item not found" };

  const item = items[index];

  if (item.lastTransactionId) {
    await deleteTransaction(item.lastTransactionId);
  }

  items[index] = { 
    ...item, 
    status: "active",
    lastTransactionId: null
  };
  
  await writeData(items);
  revalidatePath("/productivity");
  revalidatePath("/finance");
  revalidatePath("/wishlist");
  return { success: true };
}
