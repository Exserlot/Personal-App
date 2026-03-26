"use server"

import { 
  Wallet, 
  Transaction, 
  Category, 
  TotalAssetsSummary,
  WalletType,
  TransactionType,
  PaymentSlip
} from "@/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { extractQRData } from "../qr-parser";
import jsQR from "jsqr";
import { createCanvas, loadImage } from "canvas";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { Repository } from "@/lib/repository";

const SLIPS_DIR = join(process.cwd(), "public", "slips");

// Repositories
const walletRepo = new Repository<Wallet>("wallets.json");
const transactionRepo = new Repository<Transaction>("transactions.json");
const categoryRepo = new Repository<Category>("categories.json");
const slipRepo = new Repository<PaymentSlip>("slips.json");

// Helper to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// --- Wallets ---
const ICONS_DIR = join(process.cwd(), "public", "icons");

export async function getWallets(): Promise<Wallet[]> {
  try {
    const userId = await getCurrentUser();
    return await walletRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function addWallet(data: Omit<Wallet, "id" | "userId">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const newWallet: Wallet = {
      ...data,
      id: randomUUID(),
      userId,
    };
    await walletRepo.add(newWallet);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateWallet(
  id: string, 
  data: Partial<Omit<Wallet, "id" | "userId">>
): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const wallet = await walletRepo.findById(id, userId);
    
    if (!wallet) return false;

    // Check for balance change
    if (data.balance !== undefined && data.balance !== wallet.balance) {
      const diff = data.balance - wallet.balance;
      const isIncrease = diff > 0;
      
      // Create adjustment transaction
      const adjustmentTx: Transaction = {
        id: randomUUID(),
        date: new Date().toISOString(),
        amount: Math.abs(diff),
        type: isIncrease ? "income" : "expense",
        walletId: wallet.id,
        categoryId: "", // No specific category
        note: "Manual Balance Adjustment",
        userId
      };

      await transactionRepo.add(adjustmentTx);
    }

    await walletRepo.update(id, userId, data);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function uploadWalletIcon(formData: FormData): Promise<{ success: boolean; path?: string }> {
  try {
    await getCurrentUser(); // Ensure auth
    const file = formData.get("icon") as File;
    if (!file) return { success: false };

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `icon-${randomUUID()}.${fileExt}`;
    const filePath = join(ICONS_DIR, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure directory exists (node 10+, separate step if needed but usually public exists)
    // mkdir is needed if 'icons' folder doesn't exist.
    const { mkdir } = require("fs/promises");
    try {
      await mkdir(ICONS_DIR, { recursive: true });
    } catch {}

    await writeFile(filePath, buffer);
    return { success: true, path: `/icons/${fileName}` };
  } catch (error) {
    console.error("Upload icon error:", error);
    return { success: false };
  }
}

export async function deleteWallet(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    // Optional: check valid usage or delete transactions? 
    // For now simple delete.
    await walletRepo.delete(id, userId);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  try {
    const userId = await getCurrentUser();
    return await categoryRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function addCategory(name: string, type: TransactionType, color: string, icon: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const newCategory: Category = {
      id: randomUUID(),
      name,
      type,
      color,
      icon, 
      userId,
    };
    await categoryRepo.add(newCategory);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateCategory(data: Category): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    if (data.userId !== userId) return false;
    
    return await categoryRepo.update(data.id, userId, data);
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUser();
    const categories = await categoryRepo.getByUserId(userId);
    const transactions = await transactionRepo.getByUserId(userId);

    // Check usage
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      return { success: false, error: "Category is used in transactions" };
    }

    const exists = categories.some(c => c.id === id);
    if (!exists) return { success: false, error: "Category not found" };

    await categoryRepo.delete(id, userId);
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete category" };
  }
}

// --- Transactions ---

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const userId = await getCurrentUser();
    return await transactionRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function addTransaction(data: Omit<Transaction, "id" | "userId">): Promise<{ success: boolean; transactionId?: string }> {
  try {
    const userId = await getCurrentUser();
    const wallets = await walletRepo.getByUserId(userId);

    const newTransaction: Transaction = {
      ...data,
      id: randomUUID(),
      userId,
    };

    // Update Wallet Balance
    const wallet = wallets.find(w => w.id === data.walletId);
    if (!wallet) return { success: false };

    if (data.type === "income") {
      wallet.balance += data.amount;
    } else if (data.type === "expense") {
      wallet.balance -= data.amount;
    } else if (data.type === "transfer" && data.targetWalletId) {
      wallet.balance -= data.amount;
      const targetWallet = wallets.find(w => w.id === data.targetWalletId);
      if (targetWallet) {
        targetWallet.balance += data.amount;
        await walletRepo.update(targetWallet.id, userId, { balance: targetWallet.balance });
      }
    }

    // Save changes
    await transactionRepo.add(newTransaction);
    await walletRepo.update(wallet.id, userId, { balance: wallet.balance });
    
    // If slip is linked, update the slip record
    if (data.slipId) {
      await linkSlipToTransaction(data.slipId, newTransaction.id);
    }
    
    revalidatePath("/finance");
    return { success: true, transactionId: newTransaction.id };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const transactions = await transactionRepo.getByUserId(userId);
    const wallets = await walletRepo.getByUserId(userId);

    const tx = transactions.find(t => t.id === id);
    if (!tx) return false;

    // Revert balance
    const wallet = wallets.find(w => w.id === tx.walletId);
    if (wallet) {
      if (tx.type === "income") {
        wallet.balance -= tx.amount;
      } else if (tx.type === "expense") {
        wallet.balance += tx.amount;
      } else if (tx.type === "transfer" && tx.targetWalletId) {
        wallet.balance += tx.amount;
        const targetWallet = wallets.find(w => w.id === tx.targetWalletId);
        if (targetWallet) {
          targetWallet.balance -= tx.amount;
          await walletRepo.update(targetWallet.id, userId, { balance: targetWallet.balance });
        }
      }
      await walletRepo.update(wallet.id, userId, { balance: wallet.balance });
    }

    await transactionRepo.delete(id, userId);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateTransaction(data: Transaction): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    if (data.userId !== userId) return false;

    const transactions = await transactionRepo.getByUserId(userId);
    const wallets = await walletRepo.getByUserId(userId);

    const oldTx = transactions.find(t => t.id === data.id);
    if (!oldTx) return false;

    // 1. Revert Old Transaction Effect
    const oldWallet = wallets.find(w => w.id === oldTx.walletId);
    if (oldWallet) {
      if (oldTx.type === "income") {
        oldWallet.balance -= oldTx.amount;
      } else if (oldTx.type === "expense") {
        oldWallet.balance += oldTx.amount;
      } else if (oldTx.type === "transfer" && oldTx.targetWalletId) {
        oldWallet.balance += oldTx.amount;
        const oldTarget = wallets.find(w => w.id === oldTx.targetWalletId);
        if (oldTarget) {
          oldTarget.balance -= oldTx.amount;
        }
      }
      // Note: "adjustment" type is treated as read-only/informational or handled via income/expense now.
      // If we encounter a legacy "adjustment" type, we skip reverting balance logic to avoid unknown behavior,
      // or we should have stored direction. Since we switched to income/expense, this is future-proof.
    }

    // 2. Apply New Transaction Effect
    const newWallet = wallets.find(w => w.id === data.walletId);
    if (newWallet) {
      if (data.type === "income") {
        newWallet.balance += data.amount;
      } else if (data.type === "expense") {
        newWallet.balance -= data.amount;
      } else if (data.type === "transfer" && data.targetWalletId) {
        newWallet.balance -= data.amount;
        const newTarget = wallets.find(w => w.id === data.targetWalletId);
        if (newTarget) {
          newTarget.balance += data.amount;
        }
      }
    }

    // 3. Update repositories - Save all modified wallets
    // We iterate over all wallets and save those that might have changed. 
    // Affected wallets: oldTx source/target, newTx source/target.
    const affectedWalletIds = new Set([
      oldTx.walletId, 
      oldTx.targetWalletId, 
      data.walletId, 
      data.targetWalletId
    ].filter(Boolean) as string[]);

    for (const wid of affectedWalletIds) {
      const w = wallets.find(wal => wal.id === wid);
      if (w) {
        await walletRepo.update(w.id, userId, { balance: w.balance });
      }
    }

    await transactionRepo.update(data.id, userId, data);
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// --- Summary ---

export async function getFinanceSummary(): Promise<TotalAssetsSummary> {
  try {
    const userId = await getCurrentUser();
    const wallets = await walletRepo.getByUserId(userId);
    const transactions = await transactionRepo.getByUserId(userId);

    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

    // Calculate current month income/expense
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === "income") totalIncome += t.amount;
        else if (t.type === "expense") totalExpense += t.amount;
      }
    });

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      netWorth: totalBalance, // To be updated with investments later
    };
  } catch {
    return {
      totalBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      netWorth: 0
    };
  }
}

export async function getCashFlow(months: number = 6) {
  try {
    const userId = await getCurrentUser();
    const transactions = await transactionRepo.getByUserId(userId);

    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2);
      
      let income = 0;
      let expense = 0;

      transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear()) {
          if (t.type === "income") income += t.amount;
          else if (t.type === "expense") expense += t.amount;
        }
      });

      result.push({
        name: `${monthStr} '${yearStr}`,
        income,
        expense
      });
    }

    return result;
  } catch {
    return [];
  }
}

// --- Payment Slips ---

export async function getSlips(): Promise<PaymentSlip[]> {
  try {
    const userId = await getCurrentUser();
    return await slipRepo.getByUserId(userId);
  } catch {
    return [];
  }
}

export async function getSlip(id: string): Promise<PaymentSlip | null> {
  try {
    const userId = await getCurrentUser();
    return await slipRepo.findById(id, userId);
  } catch {
    return null;
  }
}

export async function uploadSlip(
  formData: FormData, 
  options: { requireQR?: boolean } = {}
): Promise<{ success: boolean; slip?: PaymentSlip; error?: string }> {
  try {
    const userId = await getCurrentUser();
    const file = formData.get("slip") as File;
    const note = formData.get("note") as string | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Convert file to buffer first to scan in memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try to scan QR code (Scan BEFORE saving)
    let qrData;
    try {
      const image = await loadImage(buffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        console.log("QR Code Detected:", code.data);
        qrData = extractQRData(code.data);
        console.log("Parsed QR Data:", qrData);
      } else {
        console.log("No QR Code detected by jsQR");
      }
    } catch (qrError) {
      console.error("QR scan error:", qrError);
      // Scan failed, but we might still save if QR is not required
    }

    // Enforce QR requirement if requested
    if (options.requireQR) {
      if (!qrData || !qrData.amount) {
        let errorMessage = "Could not read payment data from QR code. Image was not saved.";
        
        // Improve error message if we found a reference but no amount (Verification QR)
        if (qrData && qrData.reference) {
          errorMessage = `This is a 'Slip Verify' QR (Ref: ${qrData.reference}) which does not contain the transaction amount. Image was not saved.`;
        }

        return { 
          success: false, 
          error: errorMessage
        };
      }
    }

    // Generate unique filename and path
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${randomUUID()}.${fileExt}`;
    const filePath = join(SLIPS_DIR, fileName);

    // Save image file (Only if checks passed)
    await writeFile(filePath, buffer);

    // Create slip record
    const newSlip: PaymentSlip = {
      id: randomUUID(),
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      imagePath: `/slips/${fileName}`,
      qrData,
      note: note || undefined,
      userId,
    };

    await slipRepo.add(newSlip);

    revalidatePath("/finance");
    return { success: true, slip: newSlip };
  } catch (error) {
    console.error("Upload slip error:", error);
    return { success: false, error: "Failed to upload slip" };
  }
}

export async function deleteSlip(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const slip = await slipRepo.findById(id, userId);

    if (!slip) return false;

    // Delete image file
    try {
      const filePath = join(process.cwd(), "public", slip.imagePath);
      await unlink(filePath);
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue even if file deletion fails
    }

    await slipRepo.delete(id, userId);

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("Delete slip error:", error);
    return false;
  }
}

export async function updateSlipNote(id: string, note: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    return await slipRepo.update(id, userId, { note });
  } catch (error) {
    console.error("Update slip note error:", error);
    return false;
  }
}

export async function linkSlipToTransaction(slipId: string, transactionId: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    return await slipRepo.update(slipId, userId, { linkedTransactionId: transactionId });
  } catch (error) {
    console.error("Link slip to transaction error:", error);
    return false;
  }
}

// Upload slip and create transaction from QR code
export async function uploadSlipAndCreateTransaction(
  formData: FormData
): Promise<{ success: boolean; transaction?: Transaction; slip?: PaymentSlip; error?: string }> {
  try {
    const userId = await getCurrentUser();

    // Upload and scan slip with strict QR requirement
    const uploadResult = await uploadSlip(formData, { requireQR: true });
    if (!uploadResult.success || !uploadResult.slip) {
      return { success: false, error: uploadResult.error || "Failed to upload slip" };
    }

    const slip = uploadResult.slip;

    // Check if QR data exists and has amount
    if (!slip.qrData || !slip.qrData.amount) {
      return { success: false, error: "No QR code or amount found in slip", slip };
    }

    // Get categories and find "Food" category
    // Note: This relies on user having a "Food" category
    const categories = await categoryRepo.getByUserId(userId);
    const foodCategory = categories.find(c => c.name.toLowerCase() === "food" && c.type === "expense");
    
    if (!foodCategory) {
      return { success: false, error: "Food category not found. Please create it first.", slip };
    }

    // Get first wallet as default
    const wallets = await walletRepo.getByUserId(userId);
    if (wallets.length === 0) {
      return { success: false, error: "No wallet found. Please create a wallet first.", slip };
    }

    // Extract note from QR data
    const note = formData.get("note") as string | null;
    const qrNote = slip.qrData.recipient ? `Payment to ${slip.qrData.recipient}` : "Payment from QR";
    const finalNote = note || qrNote;

    // Create transaction
    const transactionData: Omit<Transaction, "id" | "userId"> = {
      date: new Date().toISOString(),
      amount: slip.qrData.amount,
      type: "expense",
      categoryId: foodCategory.id,
      walletId: wallets[0].id,
      note: finalNote,
      slipId: slip.id,
    };

    const addResult = await addTransaction(transactionData);
    if (!addResult.success) {
      return { success: false, error: "Failed to create transaction", slip };
    }

    // Get the created transaction
    const transactions = await transactionRepo.getByUserId(userId);
    const transaction = transactions.find(t => t.id === addResult.transactionId);

    return { success: true, transaction, slip };
  } catch (error) {
    console.error("Upload slip and create transaction error:", error);
    return { success: false, error: "Failed to process slip" };
  }
}
