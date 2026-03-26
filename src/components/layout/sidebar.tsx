"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useSession } from "next-auth/react";
import { useSidebar } from "./sidebar-context";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full border-r border-border bg-card transition-all duration-300 ease-in-out hidden md:flex flex-col z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header Area */}
      <div className={cn("mb-6 flex items-center h-16 transition-all", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="h-8 w-8 rounded-lg bg-primary shrink-0" />
            <span className="text-xl font-bold tracking-tight">
              Personal App
            </span>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors",
            isCollapsed && "bg-secondary/50"
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="space-y-1 flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 transition-colors group relative",
                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium animate-in fade-in duration-200 truncate">
                  {item.label}
                </span>
              )}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="mt-auto border-t border-border pt-4 px-3 pb-4 space-y-4">
        {session?.user && (
          <div className="space-y-4">
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3 px-2")}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {session.user.username?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                  <p className="text-sm font-medium truncate cursor-default">{session.user.username}</p>
                  <p className="text-xs text-muted-foreground truncate cursor-default">{session.user.email}</p>
                </div>
              )}
            </div>
            
            <div className={cn("flex flex-col gap-1")}>
              <ThemeToggle collapsed={isCollapsed} />
              <SignOutButton collapsed={isCollapsed} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

