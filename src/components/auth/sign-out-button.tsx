"use client";

import { handleSignOut } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <button
      onClick={() => handleSignOut()}
      className={cn(
        "w-full flex items-center rounded-xl p-2 transition-colors text-muted-foreground hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400",
        collapsed ? "justify-center" : "gap-3 px-3"
      )}
      title="Sign Out"
    >
      <LogOut size={18} className="shrink-0" />
      {!collapsed && <span className="text-sm font-medium flex-1 text-left">Sign Out</span>}
    </button>
  );
}
