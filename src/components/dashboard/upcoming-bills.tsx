"use client";

import { Subscription } from "@/types";
import { CalendarClock, AlertCircle } from "lucide-react";

interface UpcomingBillsProps {
  subscriptions: Subscription[];
}

export function UpcomingBills({ subscriptions }: UpcomingBillsProps) {
  // Sort subscriptions by price or arbitrarily for now, 
  // ideally we calculate exact next billing date, but for a quick overview
  // we can just list active subscriptions sorted by price descending.
  
  const activeSubs = subscriptions.sort((a, b) => b.price - a.price).slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH").format(amount);
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
                  <p className="text-xs text-muted-foreground capitalize">{sub.cycle} Billing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">฿{formatCurrency(sub.price)}</p>
                {sub.lastPaidDate && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Paid {new Date(sub.lastPaidDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
