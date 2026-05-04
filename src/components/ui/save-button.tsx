"use client";

import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SaveButtonProps {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  icon?: ReactNode;
}

export function SaveButton({
  label = "Save",
  loading = false,
  disabled = false,
  onClick,
  type = "submit",
  className,
  icon = <Save size={18} />,
}: SaveButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center gap-2",
        "w-full py-3 px-6 rounded-xl font-bold transition-all duration-200",
        "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
        "hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        className,
      )}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : icon}
      {label && <span>{label}</span>}
    </button>
  );
}
