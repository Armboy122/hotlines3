"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface BottomSheetSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export function BottomSheetSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "เลือก...",
  disabled = false,
  className,
  title,
}: BottomSheetSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Client-side only mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    handleClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Trigger button
  const triggerButton = (
    <button
      type="button"
      onClick={handleOpen}
      disabled={disabled}
      className={cn(
        "h-12 w-full flex items-center justify-between",
        "bg-white/50 backdrop-blur-sm",
        "border-2 border-gray-200/50 focus:border-emerald-500/50",
        "rounded-xl px-4 transition-all duration-300",
        "text-left text-base",
        disabled && "opacity-50 cursor-not-allowed bg-gray-100",
        !selectedOption && "text-gray-400",
        className
      )}
    >
      <span className="truncate">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <ChevronDown className="h-5 w-5 text-gray-500 shrink-0 ml-2" />
    </button>
  );

  // Modal content
  const modalContent = isOpen && mounted ? (
    createPortal(
      <div
        className="fixed inset-0 z-[99999] flex flex-col"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Modal - Bottom sheet style */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[70vh] animate-in slide-in-from-bottom duration-300">
          {/* Handle bar */}
          <div className="flex justify-center py-3 shrink-0">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">
              {title || placeholder}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 active:bg-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 shrink-0" />

          {/* Options list */}
          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {options.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                ไม่มีตัวเลือก
              </div>
            ) : (
              <div className="py-2">
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 transition-colors",
                        "active:bg-emerald-50",
                        isSelected
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "text-base text-left",
                        isSelected && "font-semibold"
                      )}>
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

          {/* Safe area padding for iPhone */}
          <div className="h-6 shrink-0 bg-white" />
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {triggerButton}
      {modalContent}
    </>
  );
}
