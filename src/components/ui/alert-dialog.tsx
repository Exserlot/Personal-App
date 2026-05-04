"use client"

import { AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export type AlertType = "error" | "info" | "success";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  type?: AlertType;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "OK",
  type = "error",
}: AlertDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center p-6 text-center">
          {type === "error" && (
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-500 shadow-inner">
              <AlertCircle size={32} />
            </div>
          )}
          {type === "success" && (
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 text-emerald-500 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
          )}
          {type === "info" && (
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-500 shadow-inner">
              <Info size={32} />
            </div>
          )}
          
          <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
