"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out pb-20 md:pb-0 pt-20 md:pt-0",
        isCollapsed ? "md:pl-20" : "md:pl-64"
      )}
    >
      <div className="container mx-auto p-6 md:p-8 max-w-7xl">
        {children}
      </div>
    </main>
  );
}
