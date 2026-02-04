"use client";

import { memo } from "react";
import { SECTION_COLORS } from "../types";
import type { SectionCardProps } from "../types";

/**
 * Card component สำหรับแบ่ง sections ในฟอร์ม
 * มี glassmorphism effect และ colored header
 */
function SectionCardComponent({ icon, title, color, children }: SectionCardProps) {
  return (
    <div className="backdrop-blur-lg bg-white/80 rounded-2xl border border-white/50 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100/50">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${SECTION_COLORS[color]}`}>
          {icon}
        </div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

export const SectionCard = memo(SectionCardComponent);
