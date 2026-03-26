"use client"

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function CustomSelect({ options, value, onChange, placeholder = "Select...", className, disabled }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
          "w-full flex items-center justify-between rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          isOpen && "border-primary ring-2 ring-primary/20",
          !selectedOption && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
             <>
               {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
               <span className="flex flex-col items-start leading-tight">
                 <span className="font-medium text-foreground">{selectedOption.label}</span>
                 {selectedOption.subLabel && <span className="text-[10px] text-muted-foreground">{selectedOption.subLabel}</span>}
               </span>
             </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in zoom-in-95 duration-100 p-1">
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No options found.</div>
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
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                    value === option.id && "bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                     {option.icon}
                     <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="font-medium">{option.label}</span>
                        {option.subLabel && <span className="text-[10px] text-muted-foreground">{option.subLabel}</span>}
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
      )}
    </div>
  );
}
