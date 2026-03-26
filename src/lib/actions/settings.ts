"use server";

import fs from "fs/promises";
import path from "path";
import { UserSettings } from "@/types";
import { revalidatePath } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "..", "data");
const FILE_PATH = path.join(DATA_DIR, "settings.json");

async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE_PATH, "[]", "utf-8");
  }
}

async function readData(): Promise<UserSettings[]> {
  await ensureFile();
  const data = await fs.readFile(FILE_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeData(data: UserSettings[]) {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getSettings(userId: string = "user-1"): Promise<UserSettings> {
  const settings = await readData();
  let userSettings = settings.find(s => s.userId === userId);
  
  if (!userSettings) {
    userSettings = {
      userId,
      theme: "system",
      currency: "THB"
    };
    settings.push(userSettings);
    await writeData(settings);
  }
  
  return userSettings;
}

export async function updateSettings(userId: string, updates: Partial<UserSettings>) {
  const settings = await readData();
  const index = settings.findIndex(s => s.userId === userId);
  
  if (index === -1) {
    settings.push({
      userId,
      theme: "system",
      currency: "THB",
      ...updates
    });
  } else {
    settings[index] = { ...settings[index], ...updates };
  }
  
  await writeData(settings);
  revalidatePath("/", "layout");
  return { success: true };
}

import { updateUser } from "@/lib/db";
import { randomUUID } from "crypto";

export async function updateProfile(userId: string, name: string, image: string) {
  await updateUser(userId, { name, image });
  revalidatePath("/", "layout");
  return { success: true };
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
