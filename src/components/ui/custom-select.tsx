"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREMIUM_INPUT_CLASS } from "@/lib/constants/styles";

export interface Option {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  subLabel?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          PREMIUM_INPUT_CLASS,
          "flex items-center justify-between",
          isOpen && "ring-2 ring-primary/20 border-primary/50",
          !selectedOption && "text-muted-foreground",
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="flex flex-col items-start leading-tight">
                <span className="font-medium text-foreground">
                  {selectedOption.label}
                </span>
                {selectedOption.subLabel && (
                  <span className="text-[10px] text-muted-foreground">
                    {selectedOption.subLabel}
                  </span>
                )}
              </span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 max-h-60 w-full overflow-hidden rounded-xl border border-white/40 dark:border-white/10 p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200",
            "bg-white dark:bg-black backdrop-blur-3xl",
          )}
        >
          <div className="max-h-56 overflow-auto scrollbar-none space-y-0.5">
            {options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found.
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none transition-all",
                    "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10",
                    value === option.id &&
                      "bg-primary/10 dark:bg-white/15 text-primary font-bold shadow-sm",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div className="flex flex-col items-start leading-none gap-0.5">
                      <span className="font-medium">{option.label}</span>
                      {option.subLabel && (
                        <span className="text-[10px] text-muted-foreground">
                          {option.subLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {value === option.id && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check size={14} className="text-primary" />
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
