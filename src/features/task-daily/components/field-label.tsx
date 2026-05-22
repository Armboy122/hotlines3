"use client";

import { memo } from "react";
import type { FieldLabelProps } from "../types";

/**
 * Label สำหรับ form fields
 * รองรับการแสดง required indicator
 */
function FieldLabelComponent({ children, required, htmlFor }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700">
      {children}
      {required && (
        <span 
          className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.45)]"
          aria-label="Required"
        />
      )}
    </label>
  );
}

export const FieldLabel = memo(FieldLabelComponent);
