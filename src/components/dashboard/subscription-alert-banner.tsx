"use client";

import { Subscription } from "@/types";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubscriptionAlertBannerProps {
  upcomingRenewals: (Subscription & { daysUntilDue: number })[];
}

export function SubscriptionAlertBanner({ upcomingRenewals }: SubscriptionAlertBannerProps) {
  if (!upcomingRenewals || upcomingRenewals.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };

  return (
    <div className="w-full flex flex-col gap-3 mb-8">
      {upcomingRenewals.map((sub) => {
        const isUrgent = sub.daysUntilDue <= 3;
        
        return (
          <Link href="/subscriptions" key={sub.id} className="block group">
            <div className={cn(
              "flex items-center justify-between p-4 rounded-3xl border backdrop-blur-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
              isUrgent 
                ? "bg-rose-500/10 dark:bg-rose-900/20 border-rose-500/30 text-rose-700 dark:text-rose-300 hover:border-rose-500/50" 
                : "bg-amber-500/10 dark:bg-amber-900/20 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:border-amber-500/50"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                  isUrgent ? "bg-rose-500/20" : "bg-amber-500/20"
                )}>
                  <AlertTriangle className={isUrgent ? "text-rose-500" : "text-amber-500"} size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {sub.name} is due {sub.daysUntilDue === 0 ? "today" : `in ${sub.daysUntilDue} day${sub.daysUntilDue > 1 ? 's' : ''}`}
                  </h3>
                  <p className="text-sm opacity-80 mt-0.5">
                    Amount: ฿{formatCurrency(sub.price)} &bull; {sub.cycle.charAt(0).toUpperCase() + sub.cycle.slice(1)} cycle
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                <span>Manage</span>
                <ChevronRight size={20} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
