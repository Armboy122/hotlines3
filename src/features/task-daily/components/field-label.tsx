"use client";

import { memo } from "react";
import type { FieldLabelProps } from "../types";

/**
 * Label สำหรับ form fields
 * รองรับการแสดง required indicator
 */
function FieldLabelComponent({ children, required }: FieldLabelProps) {
  return (
    <label className="flex items-center gap-1.5 text-[0.9rem] font-bold text-slate-700 mb-2 tracking-wide">
      {children}
      {required && (
        <span 
          className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" 
          aria-label="Required"
        />
      )}
    </label>
  );
}

export const FieldLabel = memo(FieldLabelComponent);
