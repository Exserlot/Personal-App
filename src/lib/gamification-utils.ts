export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first_blood", name: "First Step", description: "Complete your first task or habit.", icon: "🎯" },
  { id: "novice", name: "Novice", description: "Reach Level 2 (100 EXP).", icon: "🌱" },
  { id: "apprentice", name: "Apprentice", description: "Reach Level 5 (400 EXP).", icon: "⚔️" },
  { id: "master", name: "Master", description: "Reach Level 10 (900 EXP).", icon: "👑" },
];

export function calculateLevel(exp: number) {
  // Simple formula: 100 EXP per level
  return Math.floor(exp / 100) + 1;
}

export function calculateExpForNextLevel(currentExp: number) {
  const currentLevel = calculateLevel(currentExp);
  return currentLevel * 100;
}
