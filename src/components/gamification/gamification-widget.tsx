"use client";

import { BADGES } from "@/lib/gamification-utils";
import { Trophy, Star, Shield, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationWidgetProps {
  stats: {
    exp: number;
    level: number;
    nextLevelExp: number;
    unlockedBadges: string[];
  } | null;
}

export function GamificationWidget({ stats }: GamificationWidgetProps) {
  if (!stats) return null;

  const { exp, level, nextLevelExp, unlockedBadges } = stats;
  const currentLevelExp = (level - 1) * 100;
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100,
    ),
  );

  return (
    <div className="rounded-3xl border border-white/50 dark:border-white/10 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl p-8 shadow-lg space-y-8">
      {/* Level & EXP */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Star size={24} className="fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl leading-tight">Level {level}</h3>
              <p className="text-sm text-muted-foreground">
                {exp} / {nextLevelExp} EXP
              </p>
            </div>
          </div>
        </div>

        <div className="h-3 w-full bg-white/50 dark:bg-black/30 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-primary font-bold">
          <Trophy size={20} />
          <h4 className="text-lg">Your Badges</h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl border text-center transition-all",
                  isUnlocked
                    ? "bg-white/60 dark:bg-stone-700/50 border-yellow-400/50 shadow-md hover:-translate-y-1 hover:shadow-lg"
                    : "bg-white/20 dark:bg-stone-800/20 border-white/20 dark:border-white/5 opacity-50 grayscale",
                )}
                title={badge.description}
              >
                <div className="text-4xl mb-2 filter drop-shadow-md">
                  {badge.icon}
                </div>
                <p className="font-bold text-xs">{badge.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
