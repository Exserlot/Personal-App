"use client";

import { handleSignOut } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <button
      onClick={() => handleSignOut()}
      className={cn(
        "w-full flex items-center rounded-xl p-2 transition-all text-muted-foreground hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 dark:hover:from-red-900/40 dark:hover:to-red-800/40 dark:hover:text-red-200",
        collapsed ? "justify-center" : "gap-3 px-3"
      )}
      title="Sign Out"
    >
      <LogOut size={18} className="shrink-0" />
      {!collapsed && <span className="text-sm font-medium flex-1 text-left">Sign Out</span>}
    </button>
  );
}
