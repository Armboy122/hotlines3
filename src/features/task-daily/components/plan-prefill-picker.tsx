"use client";

import { useState, useCallback } from "react";
import { ChevronDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDailyReportDraftSources } from "@/hooks/useQueries";
import { useGenerateDraftsFromPlan } from "@/hooks/mutations/useDailyReportDraftMutations";
import { getPlanningItemTypeLabel } from "@/types/planning-calendar";
import type { DailyReportDraftSource, DailyReportDraftSourceCandidate, DailyReportPrefill } from "@/types/daily-report-draft";
import type { PlanningItemType } from "@/types/planning-calendar";
import { SectionCard } from "./";

// ── Props ──────────────────────────────────────────────────

interface PlanPrefillPickerProps {
  workDate: string;
  onPrefill: (prefill: DailyReportPrefill, source: DailyReportDraftSource) => void;
}

// ── Helpers ────────────────────────────────────────────────

function sourceTypeColor(type: PlanningItemType): string {
  switch (type) {
    case "team_plan":
      return "bg-blue-400";
    case "monthly_plan":
      return "bg-amber-400";
    case "large_work":
      return "bg-yellow-500";
  }
}

function sourceTypeBadgeBg(type: PlanningItemType): string {
  switch (type) {
    case "team_plan":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "monthly_plan":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "large_work":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
}

// ── Icons ──────────────────────────────────────────────────

const DocumentIcon = () => <FileText className="h-5 w-5" aria-hidden="true" />;

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
);

const SpinnerIcon = () => (
  <Loader2 className="h-4 w-4 animate-spin text-blue-500" aria-hidden="true" />
);

// ── Source Card ────────────────────────────────────────────

function SourceCard({
  item,
  onSelect,
  isLoading,
}: {
  item: DailyReportDraftSourceCandidate;
  onSelect: () => void;
  isLoading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isLoading}
      className={`
        smart-home-control w-full flex items-stretch gap-3 p-3 sm:p-4
        hover:border-blue-300 hover:bg-blue-50/30
        active:scale-[0.98] transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        text-left min-h-[44px]
      `}
    >
      {/* Color strip */}
      <div className={`w-1 rounded-full shrink-0 ${sourceTypeColor(item.sourceType)}`} />

      <div className="flex-1 min-w-0">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md border ${sourceTypeBadgeBg(item.sourceType)}`}>
            {getPlanningItemTypeLabel(item.sourceType)}
          </span>
          {item.teamName && (
            <span className="text-[10px] sm:text-xs text-gray-500 truncate">
              {item.teamName}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.title}
        </p>

        {/* Location/detail preview */}
        {(item.location || item.detail) && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {item.location || item.detail}
          </p>
        )}
      </div>

      {isLoading && <SpinnerIcon />}
    </button>
  );
}

// ── Skeleton ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="smart-home-control flex animate-pulse items-stretch gap-3 p-3 sm:p-4">
      <div className="w-1 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function PlanPrefillPicker({ workDate, onPrefill }: PlanPrefillPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DailyReportDraftSourceCandidate | null>(null);
  const hasWorkDate = workDate.trim().length > 0;

  const { data: sourcesData, isLoading, error, refetch } = useDailyReportDraftSources(
    open && hasWorkDate ? { workDate } : undefined
  );

  const prefillMutation = useGenerateDraftsFromPlan();

  const handleSelectSource = useCallback(
    (item: DailyReportDraftSourceCandidate) => {
      if (!hasWorkDate) {
        toast.warning("กรุณาเลือกวันที่ปฏิบัติงานก่อนนำเข้าแผนงาน");
        return;
      }
      setSelectedSource(item);
      prefillMutation.mutate(
        {
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          workDate: item.workDate || workDate,
        },
        {
          onSuccess: (response) => {
            onPrefill(response.prefill, response.source);
            toast.success("นำเข้าข้อมูลจากแผนงานสำเร็จ");

            // Show warnings if any
            if (response.warnings && response.warnings.length > 0) {
              response.warnings.forEach((w) => toast.warning(w));
            }

            // Collapse after successful prefill
            setOpen(false);
            setSelectedSource(null);
          },
          onError: (err: Error) => {
            toast.error("เกิดข้อผิดพลาด: " + err.message);
            setSelectedSource(null);
          },
        }
      );
    },
    [hasWorkDate, workDate, onPrefill, prefillMutation]
  );

  const items = sourcesData?.items ?? [];

  return (
    <SectionCard icon={<DocumentIcon />} title="เลือกแผนงานนำเข้า" color="blue">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => hasWorkDate && setOpen(!open)}
        disabled={!hasWorkDate}
        className="smart-home-control flex min-h-11 w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        <span>{!hasWorkDate ? "เลือกวันที่ปฏิบัติงานก่อนนำเข้าแผนงาน" : open ? "ซ่อนรายการแผนงาน" : "แสดงรายการแผนงานสำหรับวันที่เลือก"}</span>
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3">
              <p className="text-sm text-red-700 mb-2">เกิดข้อผิดพลาดในการโหลดแผนงาน</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-medium text-red-600 underline hover:text-red-800"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && items.length === 0 && (
            <div className="smart-home-panel p-4 text-center">
              <p className="text-sm text-gray-500">ไม่พบแผนงานสำหรับวันที่เลือก</p>
            </div>
          )}

          {/* Source list */}
          {!isLoading && !error && items.length > 0 && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {items.map((item) => (
                <SourceCard
                  key={`${item.sourceType}-${item.sourceId}`}
                  item={item}
                  onSelect={() => handleSelectSource(item)}
                  isLoading={
                    prefillMutation.isPending &&
                    selectedSource?.sourceType === item.sourceType &&
                    selectedSource?.sourceId === item.sourceId
                  }
                />
              ))}
            </div>
          )}

          {/* Hint */}
          <p className="text-[11px] sm:text-xs text-gray-400 text-center pt-1">
            ข้อมูลจากแผนงานจะนำเข้าเป็นค่าเริ่มต้น คุณสามารถแก้ไขได้ก่อนบันทึก
          </p>
        </div>
      )}
    </SectionCard>
  );
}
