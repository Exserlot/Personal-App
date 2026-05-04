"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface GlobalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function GlobalModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: GlobalModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Optional: Prevent background scrolling when modal is open
      // document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} rounded-3xl bg-gradient-to-br from-rose-100/80 via-purple-50/80 to-sky-100/80 dark:from-rose-950/30 dark:via-purple-900/20 dark:to-sky-950/30 backdrop-blur-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden relative flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/20 dark:border-white/5 shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
