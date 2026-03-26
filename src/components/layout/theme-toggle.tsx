"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSettings } from "@/lib/actions/settings";
import { useSession } from "next-auth/react";

export function ThemeToggle({ collapsed, isHeader }: { collapsed?: boolean, isHeader?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setIsOpen(false);
    
    if (session?.user?.id) {
       await updateSettings(session.user.id, { theme: newTheme });
    }
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center rounded-xl p-2 transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground",
          collapsed ? "justify-center" : "gap-3 px-3",
          isOpen && "bg-secondary text-foreground"
        )}
        title={collapsed ? "Theme Settings" : undefined}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span className="text-sm font-medium flex-1 text-left">Theme</span>}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute mb-2 bg-popover border border-border shadow-xl rounded-xl p-1 z-[100] animate-in slide-in-from-bottom-2 duration-200",
          collapsed 
            ? isHeader 
              ? "top-full mt-2 right-0 flex flex-row gap-1 w-auto min-w-max" 
              : "left-12 bottom-0 w-36" 
            : "bottom-full w-full"
        )}>
          {(isHeader ? (["light", "dark"] as const) : (["light", "dark", "system"] as const)).map(t => (
            <button
              key={t}
              onClick={() => handleSelect(t)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors",
                theme === t ? "text-primary font-bold" : "text-muted-foreground",
                isHeader && "px-2 py-2 justify-center"
              )}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            >
              <span className={cn("capitalize flex items-center gap-2", isHeader && "gap-0")}>
                {t === "light" && <Sun size={14} />}
                {t === "dark" && <Moon size={14} />}
                {t === "system" && <Monitor size={14} />}
                {!isHeader && t}
              </span>
              {!isHeader && theme === t && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
