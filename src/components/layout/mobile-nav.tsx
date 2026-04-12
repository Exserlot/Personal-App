"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { ChevronUp, ChevronDown } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  // Filter only enabled items
  const activeItems = NAV_ITEMS.filter(item => !item.disabled);
  
  // Take first 4 for main bar, rest for expansion
  const mainItems = activeItems.slice(0, 4);
  const extraItems = activeItems.slice(4);

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/60 dark:bg-stone-900/60 backdrop-blur-3xl border-t border-white/50 dark:border-white/10 transition-all duration-300 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] py-2",
      expanded ? "pb-8" : "pb-safe"
    )}>
      
      {/* Floating Toggle Button */}
      {extraItems.length > 0 && (
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 border-4 border-background",
              expanded 
                ? "bg-primary text-primary-foreground rotate-180" 
                : "bg-card text-foreground"
            )}
          >
            <ChevronUp size={24} />
          </button>
        </div>
      )}

      {/* Main Nav Bar */}
      <nav className="grid grid-cols-4 gap-x-2 px-6 h-16 relative z-10 w-full max-w-sm mx-auto items-center">
        {mainItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setExpanded(false)}
              className="flex flex-col items-center justify-center gap-1.5 h-full transition-colors w-full"
            >
              <item.icon size={22} className={cn(
                "transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors cursor-pointer text-center",
                isActive ? "text-primary font-bold" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Expandable Menu Grid */}
      <div className={cn(
        "grid grid-cols-4 gap-y-6 gap-x-2 px-6 overflow-hidden transition-all duration-300 ease-in-out w-full max-w-sm mx-auto",
        expanded ? "max-h-96 opacity-100 mt-6 mb-4" : "max-h-0 opacity-0 mt-0 mb-0"
      )}>
        {extraItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={`extra-${item.href}`}
              href={item.href}
              onClick={() => setExpanded(false)}
              className="flex flex-col items-center justify-start gap-1.5 transition-all group w-full"
            >
              <item.icon size={22} className={cn(
                "transition-all duration-200 group-hover:scale-110",
                isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary/70"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors text-center break-words w-full px-1",
                isActive ? "text-primary font-bold" : "text-muted-foreground group-hover:text-primary/70"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
