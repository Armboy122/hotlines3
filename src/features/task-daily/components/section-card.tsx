"use client";

import { memo } from "react";
import { SECTION_COLORS } from "../types";
import type { SectionCardProps } from "../types";

/**
 * Card component สำหรับแบ่ง sections ในฟอร์ม
 * ใช้การ์ดพื้นขาวและสีสถานะตาม Requirement D
 */
function SectionCardComponent({ icon, title, color, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
      {/* Subtle background glow effect on hover */}
      <div className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-md ${
        color === 'blue' ? 'bg-blue-400' : 'bg-amber-400'
      }`} />
      
      {/* Header */}
      <div className="relative flex items-center gap-3 px-5 py-4 border-b border-gray-100/50 bg-white/40">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${SECTION_COLORS[color]} ring-1 ring-black/5`}>
          <div className="drop-shadow-sm">{icon}</div>
        </div>
        <h2 className="font-extrabold text-lg tracking-tight text-gray-900 drop-shadow-sm">{title}</h2>
      </div>

      {/* Content */}
      <div className="relative p-5 space-y-5">
        {children}
      </div>
    </div>
  );
}

export const SectionCard = memo(SectionCardComponent);
