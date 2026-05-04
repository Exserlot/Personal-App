"use client";

import { WishlistItem } from "@/types";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WishlistWidgetProps {
  items: WishlistItem[];
}

export function WishlistWidget({ items }: WishlistWidgetProps) {
  // Filter active items and sort by priority (high > medium > low)
  const activeItems = items.filter((i) => i.status === "active");
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const topItems = activeItems
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 3);

  return (
    <div className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Wishlist</h3>
            <p className="text-xs text-muted-foreground">
              {activeItems.length} items
            </p>
          </div>
        </div>
        <Link
          href="/wishlist"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Wishlist Items */}
      <div className="space-y-3">
        {topItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Your wishlist is empty</p>
          </div>
        ) : (
          topItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 mb-2 rounded-2xl bg-white/50 dark:bg-stone-700/30 hover:bg-white/80 dark:hover:bg-stone-700/60 hover:shadow-md transition-all border border-transparent hover:border-white/50"
            >
              <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBag size={20} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                      item.priority === "high" && "bg-rose-100 text-rose-600",
                      item.priority === "medium" &&
                        "bg-amber-100 text-amber-600",
                      item.priority === "low" &&
                        "bg-emerald-100 text-emerald-600",
                    )}
                  >
                    {item.priority}
                  </span>
                </div>
                <span className="text-xs text-primary font-bold">
                  ฿{item.price.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
