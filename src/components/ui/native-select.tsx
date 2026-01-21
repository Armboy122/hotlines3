"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface NativeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function NativeSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "เลือก...",
  disabled = false,
  className,
  id,
}: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          "h-12 w-full appearance-none",
          "bg-white/50 backdrop-blur-sm",
          "border-2 border-gray-200/50 focus:border-emerald-500/50",
          "rounded-xl px-4 pr-10",
          "text-base text-gray-900",
          "focus:outline-none focus:ring-4 focus:ring-emerald-500/10",
          "transition-all duration-300",
          "cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          !value && "text-gray-400",
          className
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2",
          "h-5 w-5 text-gray-500 pointer-events-none",
          disabled && "text-gray-300"
        )}
      />
    </div>
  );
}
