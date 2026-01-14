"use client";

import { useState, useMemo, useEffect } from "react";
import { Drawer } from "vaul";
import { Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface SelectOption {
  value: string;
  label: string;
}

interface MobileSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: readonly SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function MobileSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "เลือก...",
  searchPlaceholder = "ค้นหา...",
  emptyText = "ไม่พบข้อมูล",
  disabled = false,
  className,
}: MobileSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSelect = (optionValue: string) => {
    if (onValueChange) {
      onValueChange(optionValue);
    }
    // Small delay to show selection before closing
    setTimeout(() => {
      setOpen(false);
      setSearchQuery("");
    }, 150);
  };

  // Reset search when drawer closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      modal={true}
      dismissible={true}
      shouldScaleBackground={false}
    >
      <Drawer.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={cn(
            "h-12 w-full flex items-center justify-between",
            "backdrop-blur-sm bg-white/50 hover:bg-white/70",
            "border-2 border-gray-200/50 focus:border-emerald-500/50",
            "rounded-xl px-3 transition-all duration-300",
            "text-left text-base",
            disabled && "opacity-50 cursor-not-allowed",
            !selectedOption && "text-gray-400",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="shrink-0 text-gray-600 ml-2"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[9998]" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-col">
          {/* Glass morphism container */}
          <div className="backdrop-blur-xl bg-white/95 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]">
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header with search */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/90 px-4 pb-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <Drawer.Title className="text-lg font-bold text-gray-900">
                  {placeholder}
                </Drawer.Title>
                <Drawer.Close asChild>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Drawer.Close>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl text-base"
                  autoFocus
                />
              </div>
            </div>

            {/* Options list */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {emptyText}
                </div>
              ) : (
                <div className="space-y-1 pb-4">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(option.value);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                          "hover:bg-emerald-50 active:scale-[0.98]",
                          isSelected
                            ? "bg-emerald-100/70 border-2 border-emerald-500/30"
                            : "bg-white/50 border-2 border-transparent"
                        )}
                      >
                        <span
                          className={cn(
                            "text-base font-medium text-left",
                            isSelected ? "text-emerald-700" : "text-gray-900"
                          )}
                        >
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
