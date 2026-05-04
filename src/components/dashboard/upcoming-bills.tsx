"use client";

import { Subscription } from "@/types";
import { CalendarClock, AlertCircle } from "lucide-react";

interface UpcomingBillsProps {
  subscriptions: Subscription[];
}

export function UpcomingBills({ subscriptions }: UpcomingBillsProps) {
  const getNextDate = (sub: Subscription) => {
    if (sub.nextBillingDate) return new Date(sub.nextBillingDate);
    // Rough estimate if missing
    if (sub.lastPaidDate) {
      const date = new Date(sub.lastPaidDate);
      if (sub.cycle === "monthly") date.setMonth(date.getMonth() + 1);
      else if (sub.cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
      return date;
    }
    return new Date(9999, 11, 31); // Far future if no dates
  };

  const activeSubs = [...subscriptions]
    .sort((a, b) => getNextDate(a).getTime() - getNextDate(b).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };

  return (
    <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <CalendarClock className="text-purple-500" size={20} />
        <h3 className="font-bold text-lg">Upcoming Bills</h3>
      </div>

      {activeSubs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[150px]">
          <AlertCircle size={32} className="mb-2 opacity-20" />
          <p className="text-sm">No active subscriptions</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {activeSubs.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-stone-700/50 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-white/40 dark:hover:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                  <CalendarClock size={16} />
                </div>
                <div>
                  <p className="font-medium text-sm leading-none mb-1">{sub.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{sub.cycle.toLowerCase()} Billing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">฿{formatCurrency(sub.price)}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${getNextDate(sub).getTime() - new Date().getTime() <= 3 * 24 * 60 * 60 * 1000 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                  Due {getNextDate(sub).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
