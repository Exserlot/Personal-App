"use server";

import path from "path";
import fs from "fs/promises";
import { UserSettings } from "@/types";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function getSettings(userId: string): Promise<UserSettings> {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });
    
    if (!settings) {
      const newSettings = await prisma.userSettings.create({
        data: {
          theme: "SYSTEM",
          currency: "THB",
          user: { connect: { id: userId } }
        }
      });
      return {
        userId: newSettings.userId,
        theme: newSettings.theme.toLowerCase() as any,
        currency: newSettings.currency,
        defaultWalletId: newSettings.defaultWalletId || undefined
      };
    }

    return {
      userId: settings.userId,
      theme: settings.theme.toLowerCase() as any,
      currency: settings.currency,
      defaultWalletId: settings.defaultWalletId || undefined
    };
  } catch (error) {
    console.error("getSettings error:", error);
    return { userId, theme: "system", currency: "THB" };
  }
}

export async function updateSettings(userId: string, updates: Partial<UserSettings>) {
  try {
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        theme: (updates.theme ? updates.theme.toUpperCase() : "SYSTEM") as any,
        currency: updates.currency || "THB",
        defaultWalletId: updates.defaultWalletId,
        user: { connect: { id: userId } }
      },
      update: {
        theme: updates.theme ? updates.theme.toUpperCase() as any : undefined,
        currency: updates.currency,
        defaultWalletId: updates.defaultWalletId
      }
    });
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("updateSettings error:", error);
    return { success: false };
  }
}

export async function updateProfile(userId: string, name: string, image: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, image }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { success: false };
  }
}

export async function uploadProfileImage(formData: FormData): Promise<{ success: boolean; path?: string }> {
  try {
    const file = formData.get("image") as File;
    if (!file) return { success: false };

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `profile-${randomUUID()}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    await fs.writeFile(filePath, buffer);
    return { success: true, path: `/uploads/profiles/${fileName}` };
  } catch (error) {
    console.error("Upload profile image error:", error);
    return { success: false };
  }
}
