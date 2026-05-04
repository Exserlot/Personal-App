"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CancelButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  showIcon?: boolean;
}

export function CancelButton({
  label = "Cancel",
  onClick,
  className,
  icon = <X size={18} />,
  showIcon = false,
}: CancelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2",
        "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200",
        "border border-border bg-white/40 dark:bg-stone-800/40 backdrop-blur-md text-muted-foreground",
        "hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        className,
      )}
    >
      {showIcon && icon}
      {label && <span>{label}</span>}
    </button>
  );
}
