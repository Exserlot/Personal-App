"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { calculateLevel, calculateExpForNextLevel } from "@/lib/gamification-utils";

export async function getUserStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { exp: true, unlockedBadges: true }
  });

  if (!user) return null;

  return {
    exp: user.exp,
    level: calculateLevel(user.exp),
    nextLevelExp: calculateExpForNextLevel(user.exp),
    unlockedBadges: user.unlockedBadges
  };
}

export async function addExpAndCheckBadges(amount: number) {
  const session = await auth();
  if (!session?.user?.id) return { expGained: 0, newBadges: [] };

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { exp: true, unlockedBadges: true }
  });

  if (!user) return { expGained: 0, newBadges: [] };

  let newExp = user.exp + amount;
  let newBadges: string[] = [];
  let currentBadges = new Set(user.unlockedBadges);

  // Check Badge Conditions
  if (newExp > 0 && !currentBadges.has("first_blood")) {
    newBadges.push("first_blood");
    currentBadges.add("first_blood");
  }
  
  if (calculateLevel(newExp) >= 2 && !currentBadges.has("novice")) {
    newBadges.push("novice");
    currentBadges.add("novice");
  }

  if (calculateLevel(newExp) >= 5 && !currentBadges.has("apprentice")) {
    newBadges.push("apprentice");
    currentBadges.add("apprentice");
  }

  if (calculateLevel(newExp) >= 10 && !currentBadges.has("master")) {
    newBadges.push("master");
    currentBadges.add("master");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      exp: newExp,
      unlockedBadges: Array.from(currentBadges)
    }
  });

  return {
    expGained: amount,
    newBadges
  };
}
