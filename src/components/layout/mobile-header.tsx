"use client";

import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function MobileHeader() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/95 backdrop-blur z-50 flex items-center justify-between px-4 md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <span className="text-lg font-bold tracking-tight">Antigravity</span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {session?.user && (
           <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                {session.user.username?.[0]?.toUpperCase() || <User size={16} />}
             </div>
           </div>
        )}
        <div className="border-l border-border pl-2 flex items-center gap-1">
            <ThemeToggle collapsed={true} isHeader={true} />
            <SignOutButton collapsed={true} />
        </div>
      </div>
    </header>
  );
}
