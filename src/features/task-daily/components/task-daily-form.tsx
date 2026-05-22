"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import "antd-mobile/es/global";
import { Picker, ConfigProvider } from "antd-mobile";
import thTH from "antd-mobile/es/locales/th-TH";
import {
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Loader2,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTaskDaily, useDailyReportDrafts } from "@/hooks/useQueries";
import { useUpload } from "@/hooks/useUpload";
import type { CreateTaskDailyData } from "@/types/task-daily";
import { FieldLabel, SectionCard, SearchablePicker, ImageUploadBox, LocationPicker } from "./";
import PlanPrefillPicker from "./plan-prefill-picker";
import { INITIAL_FORM_STATE, type FormProps, type FormData, type PendingImage } from "../types";
import { validateFormData, emptyToUndefined } from "../utils";
import type { DailyReportDraftSource, DailyReportPrefill } from "@/types/daily-report-draft";

// ========== Icons ==========
const iconClass = "h-5 w-5";
const inputClassName = "smart-home-control smart-home-focus h-12 w-full px-4 text-base outline-none focus:border-sky-300 focus:bg-white";

const CalendarIcon = () => <CalendarDays className={iconClass} aria-hidden="true" />;
const BriefcaseIcon = () => <BriefcaseBusiness className={iconClass} aria-hidden="true" />;
const ZapIcon = () => <Zap className={iconClass} aria-hidden="true" />;
const TextIcon = () => <FileText className={iconClass} aria-hidden="true" />;
const CameraIcon = () => <Camera className={iconClass} aria-hidden="true" />;
const CheckIcon = () => <Check className={iconClass} aria-hidden="true" />;
const WarningIcon = () => <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />;
const ChevronDownIcon = () => <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />;

// ========== Main Form Component ==========
export default function TaskDailyForm({ jobTypes, jobDetails, feeders, teams, initialPlanSource = null }: FormProps) {
  // ===== State =====
  const [form, setForm] = useState<FormData>(INITIAL_FORM_STATE);
  const [resetKey, setResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { upload } = useUpload();
  const createTaskMutation = useCreateTaskDaily();
  const initialPrefillQuery = useDailyReportDrafts(initialPlanSource ?? undefined);
  const [appliedInitialSourceKey, setAppliedInitialSourceKey] = useState<string | null>(null);

  // ===== Memoized Data =====

  // กรอง job details ตาม job type ที่เลือก
  const filteredJobDetails = useMemo(() => {
    if (!form.jobTypeId) return jobDetails;
    return jobDetails.filter(
      (jd) => !jd.jobTypeId || jd.jobTypeId === form.jobTypeId
    );
  }, [form.jobTypeId, jobDetails]);

  // แปลงข้อมูลเป็น picker options
  const teamColumns = useMemo(
    () => [teams.map((t) => ({ label: t.name, value: t.id.toString() }))],
    [teams]
  );

  const jobTypeColumns = useMemo(
    () => [jobTypes.map((j) => ({ label: j.name, value: j.id.toString() }))],
    [jobTypes]
  );

  const jobDetailOptions = useMemo(
    () => filteredJobDetails.map((j) => ({ label: j.name, value: j.id.toString() })),
    [filteredJobDetails]
  );

  const feederOptions = useMemo(
    () => feeders.map((f) => ({ label: `${f.code} - ${f.station?.name || ""}`, value: f.id.toString() })),
    [feeders]
  );

  // ===== Form Handlers =====

  // อัพเดทค่าใน form
  const updateForm = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Reset form กลับค่าเริ่มต้น
  const resetForm = useCallback(() => {
    // Revoke all Object URLs before resetting
    form.pendingBefore.forEach(p => URL.revokeObjectURL(p.previewUrl));
    form.pendingAfter.forEach(p => URL.revokeObjectURL(p.previewUrl));

    setForm(INITIAL_FORM_STATE);
    setResetKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [form]);

  // Apply prefill from plan source — merge into form without overwriting images
  const applyPrefillToForm = useCallback((prefill: DailyReportPrefill, source?: DailyReportDraftSource) => {
    setForm((prev) => ({
      ...prev,
      workDate: prefill.workDate || prev.workDate,
      teamId: prefill.teamId ?? prev.teamId,
      feederId: prefill.feederId != null ? prefill.feederId.toString() : prev.feederId,
      numPole: prefill.numPole ?? prev.numPole,
      deviceCode: prefill.deviceCode ?? prev.deviceCode,
      detail: prefill.detail
        ? prev.detail
          ? `${prev.detail}\n${prefill.detail}`
          : prefill.detail
        : prev.detail,
      latitude: prefill.latitude ?? prev.latitude,
      longitude: prefill.longitude ?? prev.longitude,
      sourceType: source?.sourceType ?? prev.sourceType,
      sourceId: source?.sourceId ?? prev.sourceId,
      // Do NOT overwrite jobTypeId, jobDetailId — user must select manually
      // Do NOT overwrite images — those are user content
    }));
  }, []);

  useEffect(() => {
    if (!initialPrefillQuery.data || !initialPlanSource) return;
    const sourceKey = `${initialPlanSource.sourceType}:${initialPlanSource.sourceId}:${initialPlanSource.workDate ?? ""}`;
    if (appliedInitialSourceKey === sourceKey) return;
    applyPrefillToForm(initialPrefillQuery.data.prefill, initialPrefillQuery.data.source);
    setAppliedInitialSourceKey(sourceKey);
    toast.success("นำเข้าข้อมูลจากแผนงานตามลิงก์แล้ว");
  }, [appliedInitialSourceKey, applyPrefillToForm, initialPlanSource, initialPrefillQuery.data]);

  // ===== Submit Handlers =====

  // บันทึกข้อมูลจริง (parallel upload for better performance)
  const doSubmit = useCallback(async (formData: FormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const totalImages = formData.pendingBefore.length + formData.pendingAfter.length;

      // 1. อัปโหลดรูปก่อนทำงานไป S3 (Parallel)
      setUploadProgress(10); // เริ่มต้น

      const beforeUploads = formData.pendingBefore.map(pending => upload(pending.file));
      const beforeResults = await Promise.all(beforeUploads);

      // ตรวจสอบว่าอัปโหลดสำเร็จหมดหรือไม่
      const failedBefore = beforeResults.find(r => !r.success || !r.data);
      if (failedBefore) {
        toast.error("อัปโหลดรูปก่อนทำงานล้มเหลว");
        return;
      }
      const urlsBefore = beforeResults.map(r => r.data!.url);

      // อัปเดต progress หลังอัปโหลด before images
      const beforeProgress = totalImages > 0 ? Math.round((formData.pendingBefore.length / totalImages) * 50) : 0;
      setUploadProgress(10 + beforeProgress);

      // 2. อัปโหลดรูปหลังทำงานไป S3 (Parallel)

      const afterUploads = formData.pendingAfter.map(pending => upload(pending.file));
      const afterResults = await Promise.all(afterUploads);

      // ตรวจสอบว่าอัปโหลดสำเร็จหมดหรือไม่
      const failedAfter = afterResults.find(r => !r.success || !r.data);
      if (failedAfter) {
        toast.error("อัปโหลดรูปหลังทำงานล้มเหลว");
        return;
      }
      const urlsAfter = afterResults.map(r => r.data!.url);

      // อัปโหลดเสร็จทั้งหมด
      setUploadProgress(70);

      // 3. สร้าง submit data
      const submitData: CreateTaskDailyData = {
        workDate: formData.workDate,
        teamId: formData.teamId,
        jobTypeId: formData.jobTypeId,
        jobDetailId: formData.jobDetailId,
        feederId: formData.feederId ? parseInt(formData.feederId) : undefined,
        numPole: emptyToUndefined(formData.numPole),
        deviceCode: emptyToUndefined(formData.deviceCode),
        detail: emptyToUndefined(formData.detail),
        urlsBefore,
        urlsAfter,
        latitude: formData.latitude,
        longitude: formData.longitude,
        sourceType: formData.sourceType ?? undefined,
        sourceId: formData.sourceId ?? undefined,
        largeWorkTaskId: formData.largeWorkTaskId ?? undefined,
      };

      // 4. Mutate ผ่าน React Query (use mutateAsync to await result)
      setUploadProgress(80);
      await createTaskMutation.mutateAsync(submitData);

      // Success handling
      setUploadProgress(100);
      toast.success("บันทึกข้อมูลสำเร็จ");
      setTimeout(() => {
        createTaskMutation.reset();
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("[doSubmit] Submit error:", error);
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึก");
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  }, [upload, createTaskMutation]);

  // Validate และแสดง confirmation
  const handleSubmit = useCallback(() => {
    const validation = validateFormData(form);
    if (!validation.isValid) {
      toast.error(validation.message!);
      return;
    }

    setShowConfirmDialog(true);
  }, [form]);

  // ===== Object URL Cleanup =====
  useEffect(() => {
    return () => {
      form.pendingBefore.forEach(p => URL.revokeObjectURL(p.previewUrl));
      form.pendingAfter.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Render =====
  return (
    <ConfigProvider locale={thTH}>
      <div key={resetKey} className="min-h-screen bg-transparent">
        <div className="max-w-2xl mx-auto px-2 py-3 pb-28 sm:px-4 sm:py-5 md:pb-10">
          {/* Header */}
          <FormHeader />

          <div className="space-y-6">
            {/* Plan Prefill Picker */}
            <PlanPrefillPicker
              workDate={form.workDate}
              onPrefill={applyPrefillToForm}
            />

            {/* Section: ข้อมูลพื้นฐาน */}
            <SectionCard icon={<CalendarIcon />} title="ข้อมูลพื้นฐาน" color="blue">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* วันที่ */}
                <div>
                  <FieldLabel htmlFor="daily-work-date" required>วันที่ทำงาน</FieldLabel>
                  <input
                    id="daily-work-date"
                    name="workDate"
                    type="date"
                    value={form.workDate}
                    onChange={(e) => updateForm("workDate", e.target.value)}
                    className={inputClassName}
                  />
                </div>

                {/* ทีม */}
                <div>
                  <FieldLabel required>ทีม</FieldLabel>
                  <Picker
                    columns={teamColumns}
                    value={form.teamId ? [form.teamId.toString()] : []}
                    onConfirm={(val) => updateForm("teamId", parseInt(val[0] as string, 10))}
                  >
                    {(_, actions) => (
                      <PickerTrigger
                        onClick={actions.open}
                        label={teams.find((t) => t.id === form.teamId)?.name}
                        placeholder="เลือกทีม"
                      />
                    )}
                  </Picker>
                </div>
              </div>
            </SectionCard>

            {/* Section: ประเภทงาน */}
            <SectionCard icon={<BriefcaseIcon />} title="ประเภทงาน" color="blue">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ประเภทงาน */}
                <div>
                  <FieldLabel required>ประเภทงาน</FieldLabel>
                  <Picker
                    columns={jobTypeColumns}
                    value={form.jobTypeId ? [form.jobTypeId.toString()] : []}
                    onConfirm={(val) => {
                      updateForm("jobTypeId", parseInt(val[0] as string, 10));
                      updateForm("jobDetailId", 0);
                    }}
                  >
                    {(_, actions) => (
                      <PickerTrigger
                        onClick={actions.open}
                        label={jobTypes.find((j) => j.id === form.jobTypeId)?.name}
                        placeholder="เลือกประเภทงาน"
                      />
                    )}
                  </Picker>
                </div>

                {/* รายละเอียดงาน */}
                <div>
                  <FieldLabel required>รายละเอียดงาน</FieldLabel>
                  <SearchablePicker
                    value={form.jobDetailId ? form.jobDetailId.toString() : ""}
                    onChange={(val) => updateForm("jobDetailId", parseInt(val, 10) || 0)}
                    options={jobDetailOptions}
                    placeholder={form.jobTypeId ? "เลือกรายละเอียดงาน" : "เลือกประเภทงานก่อน"}
                    title="เลือกรายละเอียดงาน"
                    disabled={!form.jobTypeId}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Section: ข้อมูลสถานที่ */}
            <SectionCard icon={<ZapIcon />} title="ข้อมูลสถานที่" color="amber">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* ฟีดเดอร์ */}
                <div>
                  <FieldLabel>ฟีดเดอร์</FieldLabel>
                  <SearchablePicker
                    value={form.feederId || ""}
                    onChange={(val) => updateForm("feederId", val)}
                    options={feederOptions}
                    placeholder="เลือกฟีดเดอร์"
                    title="เลือกฟีดเดอร์"
                  />
                </div>

                {/* หมายเลขเสา */}
                <div>
                  <FieldLabel htmlFor="daily-num-pole">หมายเลขเสา</FieldLabel>
                  <input
                    id="daily-num-pole"
                    name="numPole"
                    type="text"
                    value={form.numPole || ""}
                    onChange={(e) => updateForm("numPole", e.target.value)}
                    placeholder="เช่น 123/45"
                    className={inputClassName}
                  />
                </div>

                {/* รหัสอุปกรณ์ */}
                <div>
                  <FieldLabel htmlFor="daily-device-code">รหัสอุปกรณ์</FieldLabel>
                  <input
                    id="daily-device-code"
                    name="deviceCode"
                    type="text"
                    value={form.deviceCode || ""}
                    onChange={(e) => updateForm("deviceCode", e.target.value)}
                    placeholder="เช่น ABS-001"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Map */}
              <LocationPicker
                value={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
                onChange={(val) => {
                  updateForm("latitude", val.lat);
                  updateForm("longitude", val.lng);
                }}
              />
            </SectionCard>

            {/* Section: รายละเอียด */}
            <SectionCard icon={<TextIcon />} title="รายละเอียดเพิ่มเติม" color="amber">
              <div>
                <FieldLabel htmlFor="daily-detail">รายละเอียดงาน</FieldLabel>
                <input
                  id="daily-detail"
                  name="detail"
                  type="text"
                  value={form.detail || ""}
                  onChange={(e) => updateForm("detail", e.target.value)}
                  placeholder="รายละเอียดงานเพิ่มเติม"
                  className={inputClassName}
                />
              </div>
            </SectionCard>

            {/* Section: รูปภาพ */}
            <SectionCard icon={<CameraIcon />} title="รูปภาพประกอบ" color="blue">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploadBox
                  label="รูปก่อนทำงาน (ถ้ามี)"
                  images={form.pendingBefore}
                  onAdd={(pending: PendingImage) => updateForm("pendingBefore", [...form.pendingBefore, pending])}
                  onRemove={(i: number) => {
                    URL.revokeObjectURL(form.pendingBefore[i].previewUrl);
                    updateForm("pendingBefore", form.pendingBefore.filter((_, idx) => idx !== i));
                  }}
                  maxImages={1}
                  color="blue"
                />
                <ImageUploadBox
                  label="รูปหลังทำงาน (ถ้ามี)"
                  images={form.pendingAfter}
                  onAdd={(pending: PendingImage) => updateForm("pendingAfter", [...form.pendingAfter, pending])}
                  onRemove={(i: number) => {
                    URL.revokeObjectURL(form.pendingAfter[i].previewUrl);
                    updateForm("pendingAfter", form.pendingAfter.filter((_, idx) => idx !== i));
                  }}
                  maxImages={2}
                  color="blue"
                />
              </div>
            </SectionCard>

            <div className="smart-home-panel flex items-start gap-3 border-amber-200/80 bg-amber-50/70 p-4">
              <WarningIcon />
              <span className="text-sm text-amber-800 font-medium">
                รูปก่อน/หลังเป็นข้อมูลเสริม ไม่บังคับ แต่ถ้ามีจะช่วยให้รายงานตรวจสอบย้อนหลังได้ชัดขึ้น
              </span>
            </div>

            {/* Submit Button */}
            <SubmitButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 border-t border-white/70 bg-white/90 shadow-[0_-18px_44px_rgba(30,92,165,0.18)] backdrop-blur-xl xl:bottom-0">
            <div className="mx-auto max-w-2xl px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900">
                  กำลังบันทึกข้อมูล… {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="smart-home-card border-white/70 bg-white/95 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckIcon />
                ยืนยันการบันทึก
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                คุณต้องการบันทึกข้อมูลนี้หรือไม่?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
                className="smart-home-control h-12 flex-1 px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  // Optimistic Update: Snapshot form data ก่อน reset
                  const formSnapshot = {
                    ...form,
                    pendingBefore: [...form.pendingBefore],
                    pendingAfter: [...form.pendingAfter]
                  };

                  // แสดง UI feedback ทันที
                  setShowConfirmDialog(false);
                  toast.info("กำลังบันทึกข้อมูล...", { duration: 2000 });

                  // Reset form ทันที (ให้ผู้ใช้รู้สึกว่าเร็ว)
                  resetForm();

                  // ทำงานจริงใน background ด้วย snapshot data
                  doSubmit(formSnapshot).catch(error => {
                    console.error("[Optimistic Update] Background save failed:", error);
                    // Error จะถูก handle ใน doSubmit แล้ว (แสดง toast.error)
                  });
                }}
                disabled={isSubmitting}
                className="h-12 flex-1 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                บันทึก
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ConfigProvider>
  );
}

// ========== Sub Components ==========

function FormHeader() {
  return (
    <div className="smart-home-hero mb-5 p-5 sm:mb-6 sm:p-6">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        {/* Custom 3D-like Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/35 bg-white/20 shadow-inner backdrop-blur-md sm:h-16 sm:w-16">
          <ClipboardList className="h-8 w-8 text-white drop-shadow-md" aria-hidden="true" />
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-black text-center tracking-tight drop-shadow-md">
            บันทึกรายงานประจำวัน
          </h1>
          <p className="text-blue-100/90 text-sm font-bold tracking-[0.2em] mt-1.5 uppercase">
            ระบบบันทึกงาน
          </p>
        </div>
      </div>
    </div>
  );
}

function PickerTrigger({
  onClick,
  label,
  placeholder,
}: {
  onClick: () => void;
  label?: string;
  placeholder: string;
}) {
  const hoverClass = "hover:border-blue-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`smart-home-control smart-home-focus flex h-12 w-full items-center justify-between px-4 text-base ${hoverClass}`}
    >
      <span className={label ? "text-gray-900" : "text-gray-400"}>
        {label || placeholder}
      </span>
      <ChevronDownIcon />
    </button>
  );
}

function SubmitButton({
  onClick,
  disabled,
  isSubmitting,
}: {
  onClick: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden w-full h-[3.5rem] sm:h-16 flex items-center justify-center gap-3
        text-lg font-black text-white rounded-2xl tracking-wide
        transition-all duration-300
        ${disabled
          ? "border border-slate-200 bg-slate-200/80 text-slate-500 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 hover:from-blue-700 hover:to-sky-500 shadow-[0_14px_30px_rgba(37,99,235,0.28)] hover:shadow-[0_18px_38px_rgba(37,99,235,0.34)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:shadow-md cursor-pointer"
        }
      `}
    >
      {/* Shine effect on hover */}
      {!disabled && !isSubmitting && (
        <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-transform duration-1000" />
      )}
      
      {isSubmitting ? (
        <>
          <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          กำลังบันทึกข้อมูล...
        </>
      ) : (
        <>
          <Check className="h-6 w-6 drop-shadow-sm" aria-hidden="true" />
          ส่งรายงาน
        </>
      )}
    </button>
  );
}
