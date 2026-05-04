"use client";

import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DeleteButtonProps {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  icon?: ReactNode;
}

export function DeleteButton({
  label = "Delete",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className,
  icon = <Trash2 size={18} />,
}: DeleteButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center gap-2",
        "w-full py-3 px-6 rounded-xl font-bold transition-all duration-200",
        "bg-rose-50 border border-rose-200 text-rose-600 shadow-sm",
        "hover:bg-rose-100 active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/30",
        className,
      )}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : icon}
      {label && <span>{label}</span>}
    </button>
  );
}
