"use server"

import { 
  Wallet, 
  Transaction, 
  Category, 
  TotalAssetsSummary,
  WalletType,
  TransactionType,
  PaymentSlip,
  Budget
} from "@/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { extractQRData } from "../qr-parser";
import jsQR from "jsqr";
import { createCanvas, loadImage } from "canvas";
import { bucket } from "@/lib/gcs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// Helpers to map Prisma to local types
function mapWallet(w: any): Wallet {
  return {
    ...w,
    type: w.type.toLowerCase() as WalletType,
    balance: w.balance.toNumber(),
  };
}

function mapTransaction(t: any): Transaction {
  return {
    ...t,
    amount: t.amount.toNumber(),
    date: t.date.toISOString(),
  };
}

function mapSlip(s: any): PaymentSlip {
  return {
    ...s,
    uploadDate: s.uploadDate.toISOString(),
    qrData: s.qrData ? (s.qrData as any) : undefined,
  };
}

// Ensure system adjustment category exists to fulfill foreign keys
async function ensureAdjustmentCategory(userId: string, txClient: any = prisma): Promise<string> {
  let cat = await txClient.category.findFirst({
    where: { userId, type: "adjustment", name: "System Adjustment" }
  });
  if (!cat) {
    cat = await txClient.category.create({
      data: {
        name: "System Adjustment",
        type: "adjustment",
        color: "#6b7280",
        icon: "settings",
        user: { connect: { id: userId } }
      }
    });
  }
  return cat.id;
}

// --- Wallets ---

export async function getWallets(): Promise<Wallet[]> {
  try {
    const userId = await getCurrentUser();
    const wallets = await prisma.wallet.findMany({ where: { userId } });
    return wallets.map(mapWallet);
  } catch (error) {
    console.error("getWallets Error:", error);
    return [];
  }
}

export async function addWallet(data: Omit<Wallet, "id" | "userId">): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.wallet.create({
      data: {
        name: data.name,
        type: data.type.toUpperCase() as any,
        balance: data.balance,
        color: data.color,
        icon: data.icon,
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("addWallet Error:", error);
    return false;
  }
}

export async function updateWallet(
  id: string, 
  data: Partial<Omit<Wallet, "id" | "userId">>
): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const wallet = await prisma.wallet.findUnique({ where: { id } });
    
    if (!wallet || wallet.userId !== userId) return false;

    await prisma.$transaction(async (tx) => {
      // Check for balance change
      if (data.balance !== undefined && data.balance !== wallet.balance.toNumber()) {
        const diff = data.balance - wallet.balance.toNumber();
        const isIncrease = diff > 0;
        
        const adjCatId = await ensureAdjustmentCategory(userId, tx);

        await tx.transaction.create({
          data: {
            date: new Date(),
            amount: Math.abs(diff),
            type: isIncrease ? "income" : "expense",
            wallet: { connect: { id: wallet.id } },
            category: { connect: { id: adjCatId } },
            note: "Manual Balance Adjustment",
            user: { connect: { id: userId } }
          }
        });
      }

      await tx.wallet.update({
        where: { id },
        data: {
          name: data.name,
          type: data.type ? data.type.toUpperCase() as any : undefined,
          balance: data.balance,
          color: data.color,
          icon: data.icon,
        }
      });
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("updateWallet Error:", error);
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
    const gcsPath = `icons/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const gcsFile = bucket.file(gcsPath);
    await gcsFile.save(buffer, {
      resumable: false,
      metadata: { contentType: file.type }
    });

    return { success: true, path: gcsPath };
  } catch (error) {
    console.error("uploadWalletIcon Error:", error);
    return { success: false };
  }
}

export async function deleteWallet(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.wallet.delete({
      where: { id, userId }
    });
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("deleteWallet Error:", error);
    return false;
  }
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  try {
    const userId = await getCurrentUser();
    const categories = await prisma.category.findMany({ where: { userId } });
    return categories as Category[];
  } catch (error) {
    console.error("getCategories Error:", error);
    return [];
  }
}

export async function addCategory(name: string, type: TransactionType, color: string, icon: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.category.create({
      data: {
        name,
        type: type as any,
        color,
        icon,
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("addCategory Error:", error);
    return false;
  }
}

export async function updateCategory(data: Category): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    if (data.userId !== userId) return false;
    
    await prisma.category.update({
      where: { id: data.id, userId },
      data: {
        name: data.name,
        type: data.type as any,
        color: data.color,
        icon: data.icon,
      }
    });
    return true;
  } catch (error) {
    console.error("updateCategory Error:", error);
    return false;
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUser();
    
    const count = await prisma.transaction.count({
      where: { categoryId: id, userId }
    });

    if (count > 0) {
      return { success: false, error: "Category is used in transactions" };
    }

    await prisma.category.delete({
      where: { id, userId }
    });
    
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("deleteCategory Error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// --- Transactions ---

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const userId = await getCurrentUser();
    const txs = await prisma.transaction.findMany({ 
      where: { userId },
      orderBy: { date: "desc" }
    });
    return txs.map(mapTransaction);
  } catch(error) {
    console.error("getTransactions Error:", error);
    return [];
  }
}

export async function addTransaction(data: Omit<Transaction, "id" | "userId">): Promise<{ success: boolean; transactionId?: string }> {
  try {
    const userId = await getCurrentUser();
    let transactionId = "";

    await prisma.$transaction(async (tx) => {
      // Create the transaction
      const newTx = await tx.transaction.create({
        data: {
          date: new Date(data.date),
          amount: data.amount,
          type: data.type as any,
          note: data.note,
          category: { connect: { id: data.categoryId } },
          wallet: { connect: { id: data.walletId } },
          targetWallet: data.targetWalletId ? { connect: { id: data.targetWalletId } } : undefined,
          slipId: data.slipId,
          user: { connect: { id: userId } }
        }
      });
      transactionId = newTx.id;

      // Update Wallet Balance
      if (data.type === "income") {
        await tx.wallet.update({
          where: { id: data.walletId },
          data: { balance: { increment: data.amount } }
        });
      } else if (data.type === "expense") {
        await tx.wallet.update({
          where: { id: data.walletId },
          data: { balance: { decrement: data.amount } }
        });
      } else if (data.type === "transfer" && data.targetWalletId) {
        await tx.wallet.update({
          where: { id: data.walletId },
          data: { balance: { decrement: data.amount } }
        });
        await tx.wallet.update({
          where: { id: data.targetWalletId },
          data: { balance: { increment: data.amount } }
        });
      }

      // Link slip
      if (data.slipId) {
        await tx.paymentSlip.update({
          where: { id: data.slipId },
          data: { linkedTransactionId: newTx.id }
        });
      }
    });
    
    revalidatePath("/finance");
    return { success: true, transactionId };
  } catch (error) {
    console.error("addTransaction Error:", error);
    return { success: false };
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    
    await prisma.$transaction(async (txClient) => {
      const tx = await txClient.transaction.findUnique({ where: { id, userId }});
      if (!tx) throw new Error("Transaction not found");

      let slip = null;
      if (tx.slipId) {
        slip = await txClient.paymentSlip.findUnique({ where: { id: tx.slipId } });
      }

      // Revert balance
      if (tx.type === "income") {
        await txClient.wallet.update({
          where: { id: tx.walletId },
          data: { balance: { decrement: tx.amount } }
        });
      } else if (tx.type === "expense") {
        await txClient.wallet.update({
          where: { id: tx.walletId },
          data: { balance: { increment: tx.amount } }
        });
      } else if (tx.type === "transfer" && tx.targetWalletId) {
        await txClient.wallet.update({
          where: { id: tx.walletId },
          data: { balance: { increment: tx.amount } }
        });
        await txClient.wallet.update({
          where: { id: tx.targetWalletId },
          data: { balance: { decrement: tx.amount } }
        });
      }

      await txClient.transaction.delete({ where: { id }});
      
      if (slip) {
        // Delete image file from GCS
        try {
          if (slip.imagePath && !slip.imagePath.startsWith("/")) {
            await bucket.file(slip.imagePath).delete();
          }
        } catch (e) {
          console.error("GCS delete error:", e);
        }
        await txClient.paymentSlip.delete({ where: { id: slip.id } });
      }
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("deleteTransaction error:", error);
    return false;
  }
}

export async function updateTransaction(data: Transaction): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    if (data.userId !== userId) return false;

    await prisma.$transaction(async (txClient) => {
      const oldTx = await txClient.transaction.findUnique({ where: { id: data.id, userId }});
      if (!oldTx) throw new Error("Transaction not found");

      // 1. Revert Old Transaction Effect
      if (oldTx.type === "income") {
        await txClient.wallet.update({
          where: { id: oldTx.walletId },
          data: { balance: { decrement: oldTx.amount } }
        });
      } else if (oldTx.type === "expense") {
        await txClient.wallet.update({
          where: { id: oldTx.walletId },
          data: { balance: { increment: oldTx.amount } }
        });
      } else if (oldTx.type === "transfer" && oldTx.targetWalletId) {
        await txClient.wallet.update({
          where: { id: oldTx.walletId },
          data: { balance: { increment: oldTx.amount } }
        });
        await txClient.wallet.update({
          where: { id: oldTx.targetWalletId },
          data: { balance: { decrement: oldTx.amount } }
        });
      }

      // 2. Apply New Transaction Effect
      if (data.type === "income") {
        await txClient.wallet.update({
          where: { id: data.walletId },
          data: { balance: { increment: data.amount } }
        });
      } else if (data.type === "expense") {
        await txClient.wallet.update({
          where: { id: data.walletId },
          data: { balance: { decrement: data.amount } }
        });
      } else if (data.type === "transfer" && data.targetWalletId) {
        await txClient.wallet.update({
          where: { id: data.walletId },
          data: { balance: { decrement: data.amount } }
        });
        await txClient.wallet.update({
          where: { id: data.targetWalletId },
          data: { balance: { increment: data.amount } }
        });
      }

      // 3. Update the transaction record
      await txClient.transaction.update({
        where: { id: data.id },
        data: {
          date: new Date(data.date),
          amount: data.amount,
          type: data.type as any,
          note: data.note,
          walletId: data.walletId,
          targetWalletId: data.targetWalletId || null,
          categoryId: data.categoryId,
        }
      });
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("updateTransaction error:", error);
    return false;
  }
}

// --- Summary ---

export async function getFinanceSummary(): Promise<TotalAssetsSummary> {
  try {
    const userId = await getCurrentUser();
    
    const wallets = await prisma.wallet.findMany({ where: { userId }});
    const totalBalance = wallets.reduce((acc, w) => acc + w.balance.toNumber(), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthTxs = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    monthTxs.forEach(t => {
      if (t.type === "income") totalIncome += t.amount.toNumber();
      else if (t.type === "expense") totalExpense += t.amount.toNumber();
    });

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      netWorth: totalBalance, // To be updated with investments later
    };
  } catch (error) {
    console.error("getFinanceSummary error:", error);
    return { totalBalance: 0, totalIncome: 0, totalExpense: 0, netWorth: 0 };
  }
}

export async function getCashFlow(months: number = 6) {
  try {
    const userId = await getCurrentUser();
    
    // Calculate the start date for the flow
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate }
      }
    });

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2);
      
      let income = 0;
      let expense = 0;

      transactions.forEach(t => {
        if (t.date.getMonth() === d.getMonth() && t.date.getFullYear() === d.getFullYear()) {
          if (t.type === "income") income += t.amount.toNumber();
          else if (t.type === "expense") expense += t.amount.toNumber();
        }
      });

      result.push({
        name: `${monthStr} '${yearStr}`,
        income,
        expense
      });
    }

    return result;
  } catch (error) {
    console.error("getCashFlow error:", error);
    return [];
  }
}

// --- Payment Slips ---

export async function getSlips(): Promise<PaymentSlip[]> {
  try {
    const userId = await getCurrentUser();
    const slips = await prisma.paymentSlip.findMany({
      where: { userId },
      orderBy: { uploadDate: "desc" }
    });
    return slips.map(mapSlip);
  } catch {
    return [];
  }
}

export async function getSlip(id: string): Promise<PaymentSlip | null> {
  try {
    const userId = await getCurrentUser();
    const slip = await prisma.paymentSlip.findUnique({ where: { id, userId } });
    return slip ? mapSlip(slip) : null;
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

    if (!file) return { success: false, error: "No file provided" };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let qrData;
    try {
      const image = await loadImage(buffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        qrData = extractQRData(code.data);
      }
    } catch {}

    if (options.requireQR) {
      if (!qrData || !qrData.amount) {
        // --- OCR Fallback: Try reading text from image using Vision AI ---
        try {
          const { extractDataFromImage } = await import('@/lib/vision');
          const ocrResult = await extractDataFromImage(buffer);
          
          if (ocrResult.amount) {
            qrData = qrData 
              ? { ...qrData, amount: ocrResult.amount, ocrDetected: true, suggestedCategory: ocrResult.suggestedCategory } 
              : { amount: ocrResult.amount, ocrDetected: true, suggestedCategory: ocrResult.suggestedCategory };
          } else {
            // OCR couldn't find an amount either
            let errorMessage = "Could not read the payment amount from the image or QR code.";
            if (qrData && qrData.reference) {
              errorMessage = `This is a 'Slip Verify' QR (Ref: ${qrData.reference}) and AI could not read the text amount from the image.`;
            }
            return { success: false, error: errorMessage };
          }
        } catch (ocrError) {
          console.error("OCR Error during fallback:", ocrError);
          return { success: false, error: "AI processing failed while trying to read the slip." };
        }
      } else {
        // If QR read successfully, try to suggest category from recipient name
        if (qrData && qrData.recipient) {
           const { suggestCategoryFromText } = await import('@/lib/vision');
           const suggested = suggestCategoryFromText(qrData.recipient);
           if (suggested) {
             qrData.suggestedCategory = suggested;
           }
        }
      }
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${randomUUID()}.${fileExt}`;
    const gcsPath = `slips/${fileName}`;

    const gcsFile = bucket.file(gcsPath);
    await gcsFile.save(buffer, {
      resumable: false,
      metadata: { contentType: file.type }
    });

    const newSlip = await prisma.paymentSlip.create({
      data: {
        fileName: file.name,
        imagePath: gcsPath,
        qrData: qrData as any,
        note: note || undefined,
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/finance");
    return { success: true, slip: mapSlip(newSlip) };
  } catch (error) {
    console.error("Upload slip error:", error);
    return { success: false, error: "Failed to upload slip" };
  }
}

export async function deleteSlip(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    const slip = await prisma.paymentSlip.findUnique({ where: { id, userId } });

    if (!slip) return false;

    // Delete image file from GCS
    try {
      if (slip.imagePath && !slip.imagePath.startsWith("/")) {
        await bucket.file(slip.imagePath).delete();
      }
    } catch (e) {
      console.error("GCS delete error:", e);
    }

    await prisma.paymentSlip.delete({ where: { id } });

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
    await prisma.paymentSlip.update({
      where: { id, userId },
      data: { note }
    });
    return true;
  } catch (error) {
    console.error("Update slip note error:", error);
    return false;
  }
}

export async function linkSlipToTransaction(slipId: string, transactionId: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.paymentSlip.update({
      where: { id: slipId, userId },
      data: { linkedTransactionId: transactionId }
    });
    return true;
  } catch (error) {
    console.error("Link slip to transaction error:", error);
    return false;
  }
}

export async function uploadSlipAndCreateTransaction(
  formData: FormData
): Promise<{ success: boolean; transaction?: Transaction; slip?: PaymentSlip; error?: string }> {
  try {
    const userId = await getCurrentUser();

    const uploadResult = await uploadSlip(formData, { requireQR: true });
    if (!uploadResult.success || !uploadResult.slip) {
      return { success: false, error: uploadResult.error || "Failed to upload slip" };
    }

    const slip = uploadResult.slip;

    if (!slip.qrData || !slip.qrData.amount) {
      return { success: false, error: "No QR code or amount found in slip", slip };
    }

    const overrideWalletId = formData.get("walletId") as string | null;
    const overrideCategoryId = formData.get("categoryId") as string | null;

    let targetCategoryId = overrideCategoryId;
    if (!targetCategoryId) {
      let categoryName = "Shopping"; // Fallback default
      let categoryIcon = "shopping";
      let categoryColor = "#F59E0B";

      if (slip.qrData && slip.qrData.suggestedCategory) {
        categoryName = slip.qrData.suggestedCategory.charAt(0).toUpperCase() + slip.qrData.suggestedCategory.slice(1);
        
        switch (slip.qrData.suggestedCategory.toLowerCase()) {
          case 'food': categoryIcon = "food"; categoryColor = "#F59E0B"; break;
          case 'shopping': categoryIcon = "shopping"; categoryColor = "#8B5CF6"; break;
          case 'travel': categoryIcon = "car"; categoryColor = "#3B82F6"; break;
          case 'health': categoryIcon = "health"; categoryColor = "#EF4444"; break;
          case 'bills': categoryIcon = "bills"; categoryColor = "#10B981"; break;
          case 'entertainment': categoryIcon = "entertainment"; categoryColor = "#EC4899"; break;
        }
      } else {
        categoryName = "Food";
        categoryIcon = "food";
      }

      let aiCategory = await prisma.category.findFirst({
        where: { userId, name: { equals: categoryName, mode: "insensitive" }, type: "expense" }
      });
      
      if (!aiCategory) {
        aiCategory = await prisma.category.create({
          data: {
            name: categoryName,
            type: "expense",
            color: categoryColor,
            icon: categoryIcon,
            user: { connect: { id: userId } }
          }
        });
      }
      targetCategoryId = aiCategory.id;
    }

    let targetWalletId = overrideWalletId;
    if (!targetWalletId) {
      const wallet = await prisma.wallet.findFirst({ where: { userId } });
      if (!wallet) {
        return { success: false, error: "No wallet found. Please create a wallet first.", slip };
      }
      targetWalletId = wallet.id;
    }

    const note = formData.get("note") as string | null;
    const qrNote = slip.qrData.recipient ? `Payment to ${slip.qrData.recipient}` : "Payment from QR";
    const finalNote = note || qrNote;

    const addResult = await addTransaction({
      date: new Date().toISOString(),
      amount: slip.qrData.amount,
      type: "expense",
      categoryId: targetCategoryId,
      walletId: targetWalletId,
      note: finalNote,
      slipId: slip.id,
    });

    if (!addResult.success || !addResult.transactionId) {
      return { success: false, error: "Failed to create transaction", slip };
    }

    const transaction = await prisma.transaction.findUnique({ where: { id: addResult.transactionId } });
    if (!transaction) throw new Error("Transaction created but not found");

    return { success: true, transaction: mapTransaction(transaction), slip };
  } catch (error) {
    console.error("Upload slip and create transaction error:", error);
    return { success: false, error: "Failed to process slip" };
  }
}

// --- Budgets ---

export async function getBudgets(month: number, year: number) {
  try {
    const userId = await getCurrentUser();
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true }
    });
    return budgets.map(b => ({
      ...b,
      amount: b.amount.toNumber()
    }));
  } catch (error) {
    console.error("getBudgets Error:", error);
    return [];
  }
}

export async function setBudget(categoryId: string, amount: number, month: number, year: number): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId, categoryId, month, year
        }
      },
      update: { amount },
      create: {
        amount, month, year,
        category: { connect: { id: categoryId } },
        user: { connect: { id: userId } }
      }
    });

    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("setBudget Error:", error);
    return false;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUser();
    await prisma.budget.delete({
      where: { id, userId }
    });
    revalidatePath("/finance");
    return true;
  } catch (error) {
    console.error("deleteBudget Error:", error);
    return false;
  }
}
