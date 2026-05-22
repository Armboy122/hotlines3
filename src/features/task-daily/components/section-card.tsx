"use client";

import { memo } from "react";
import type { SectionCardProps } from "../types";

/**
 * Card component สำหรับแบ่ง sections ในฟอร์ม
 * ใช้ smart-home surface language สำหรับพื้นที่กรอกข้อมูล
 */
function SectionCardComponent({ icon, title, color, children }: SectionCardProps) {
  const toneClass = color === "blue"
    ? "border-sky-100/80 bg-sky-50/70 text-blue-700"
    : "border-amber-100/80 bg-amber-50/70 text-amber-700";

  return (
    <section className="smart-home-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/70 bg-white/35 px-4 py-3 sm:px-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-inner ${toneClass}`}>
          <div className="drop-shadow-sm">
            {icon}
          </div>
        </div>
        <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">{title}</h2>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 sm:p-5">
        {children}
      </div>
    </section>
  );
}

export const SectionCard = memo(SectionCardComponent);
