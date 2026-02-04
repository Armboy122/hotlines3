"use client";

import { memo } from "react";
import type { FieldLabelProps } from "../types";

/**
 * Label สำหรับ form fields
 * รองรับการแสดง required indicator
 */
function FieldLabelComponent({ children, required }: FieldLabelProps) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export const FieldLabel = memo(FieldLabelComponent);
