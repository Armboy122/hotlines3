"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Picker, ConfigProvider } from "antd-mobile";
import thTH from "antd-mobile/es/locales/th-TH";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTaskDaily } from "@/hooks/useQueries";
import { useUpload } from "@/hooks/useUpload";
import type { CreateTaskDailyData } from "@/types/task-daily";
import type { JobTypeWithCount, JobDetailWithCount, FeederWithStation, Team } from "@/types/query-types";

import { FieldLabel, SectionCard, SearchablePicker, ImageUploadBox, LocationPicker } from "./";
import { INITIAL_FORM_STATE, type FormProps, type FormData, type PendingImage } from "../types";
import { validateFormData, emptyToUndefined } from "../utils";

// ========== Icons ==========
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ========== Main Form Component ==========
export default function TaskDailyForm({ jobTypes, jobDetails, feeders, teams }: FormProps) {
  // ===== State =====
  const [form, setForm] = useState<FormData>(INITIAL_FORM_STATE);
  const [resetKey, setResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { upload } = useUpload();
  const createTaskMutation = useCreateTaskDaily();

  // ===== Memoized Data =====

  // กรอง job details ตาม job type ที่เลือก
  const filteredJobDetails = useMemo(() => {
    if (!form.jobTypeId) return jobDetails;
    return jobDetails.filter(
      (jd) => !jd.jobTypeId || jd.jobTypeId.toString() === form.jobTypeId
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

  // ===== Submit Handlers =====

  // บันทึกข้อมูลจริง (deferred upload)
  const doSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // 1. อัปโหลดรูปก่อนทำงานไป S3
      const urlsBefore: string[] = [];
      for (const pending of form.pendingBefore) {
        const result = await upload(pending.file);
        if (!result.success || !result.data) {
          toast.error("อัปโหลดรูปก่อนทำงานล้มเหลว");
          return;
        }
        urlsBefore.push(result.data.url);
      }

      // 2. อัปโหลดรูปหลังทำงานไป S3
      const urlsAfter: string[] = [];
      for (const pending of form.pendingAfter) {
        const result = await upload(pending.file);
        if (!result.success || !result.data) {
          toast.error("อัปโหลดรูปหลังทำงานล้มเหลว");
          return;
        }
        urlsAfter.push(result.data.url);
      }

      // 3. สร้าง submit data
      const submitData: CreateTaskDailyData = {
        workDate: form.workDate,
        teamId: form.teamId,
        jobTypeId: form.jobTypeId,
        jobDetailId: form.jobDetailId,
        feederId: emptyToUndefined(form.feederId),
        numPole: emptyToUndefined(form.numPole),
        deviceCode: emptyToUndefined(form.deviceCode),
        detail: emptyToUndefined(form.detail),
        urlsBefore,
        urlsAfter,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      // 4. Mutate ผ่าน React Query (use mutateAsync to await result)
      await createTaskMutation.mutateAsync(submitData);

      // Success handling
      toast.success("บันทึกข้อมูลสำเร็จ");
      resetForm();
      setTimeout(() => createTaskMutation.reset(), 1000);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, upload, createTaskMutation, resetForm]);

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
      <div key={resetKey} className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        {/* Background Decorations */}
        <BackgroundOrbs />

        <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
          {/* Header */}
          <FormHeader />

          <div className="space-y-6">
            {/* Section: ข้อมูลพื้นฐาน */}
            <SectionCard icon={<CalendarIcon />} title="ข้อมูลพื้นฐาน" color="emerald">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* วันที่ */}
                <div>
                  <FieldLabel required>วันที่ทำงาน</FieldLabel>
                  <input
                    type="date"
                    value={form.workDate}
                    onChange={(e) => updateForm("workDate", e.target.value)}
                    className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                {/* ทีม */}
                <div>
                  <FieldLabel required>ทีม</FieldLabel>
                  <Picker
                    columns={teamColumns}
                    value={form.teamId ? [form.teamId] : []}
                    onConfirm={(val) => updateForm("teamId", val[0] as string)}
                  >
                    {(_, actions) => (
                      <PickerTrigger
                        onClick={actions.open}
                        label={teams.find((t) => t.id.toString() === form.teamId)?.name}
                        placeholder="เลือกทีม"
                        hoverColor="emerald"
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
                    value={form.jobTypeId ? [form.jobTypeId] : []}
                    onConfirm={(val) => {
                      updateForm("jobTypeId", val[0] as string);
                      updateForm("jobDetailId", "");
                    }}
                  >
                    {(_, actions) => (
                      <PickerTrigger
                        onClick={actions.open}
                        label={jobTypes.find((j) => j.id.toString() === form.jobTypeId)?.name}
                        placeholder="เลือกประเภทงาน"
                        hoverColor="blue"
                      />
                    )}
                  </Picker>
                </div>

                {/* รายละเอียดงาน */}
                <div>
                  <FieldLabel required>รายละเอียดงาน</FieldLabel>
                  <SearchablePicker
                    value={form.jobDetailId}
                    onChange={(val) => updateForm("jobDetailId", val)}
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
                  <FieldLabel>หมายเลขเสา</FieldLabel>
                  <input
                    type="text"
                    value={form.numPole || ""}
                    onChange={(e) => updateForm("numPole", e.target.value)}
                    placeholder="เช่น 123/45"
                    className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                </div>

                {/* รหัสอุปกรณ์ */}
                <div>
                  <FieldLabel>รหัสอุปกรณ์</FieldLabel>
                  <input
                    type="text"
                    value={form.deviceCode || ""}
                    onChange={(e) => updateForm("deviceCode", e.target.value)}
                    placeholder="เช่น ABS-001"
                    className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
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
            <SectionCard icon={<TextIcon />} title="รายละเอียดเพิ่มเติม" color="purple">
              <div>
                <FieldLabel>รายละเอียดงาน</FieldLabel>
                <input
                  type="text"
                  value={form.detail || ""}
                  onChange={(e) => updateForm("detail", e.target.value)}
                  placeholder="รายละเอียดงานเพิ่มเติม"
                  className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
            </SectionCard>

            {/* Section: รูปภาพ */}
            <SectionCard icon={<CameraIcon />} title="รูปภาพประกอบ" color="orange">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploadBox
                  label="รูปก่อนทำงาน *"
                  images={form.pendingBefore}
                  onAdd={(pending: PendingImage) => updateForm("pendingBefore", [...form.pendingBefore, pending])}
                  onRemove={(i: number) => {
                    URL.revokeObjectURL(form.pendingBefore[i].previewUrl);
                    updateForm("pendingBefore", form.pendingBefore.filter((_, idx) => idx !== i));
                  }}
                  maxImages={1}
                  color="emerald"
                />
                <ImageUploadBox
                  label="รูปหลังทำงาน"
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

            {/* Warning */}
            {form.pendingBefore.length === 0 && (
              <div className="flex items-center gap-3 p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-xl">
                <WarningIcon />
                <span className="text-sm text-amber-800 font-medium">
                  กรุณาอัปโหลดรูปก่อนทำงานอย่างน้อย 1 รูป
                </span>
              </div>
            )}

            {/* Submit Button */}
            <SubmitButton
              onClick={handleSubmit}
              disabled={isSubmitting || form.pendingBefore.length === 0}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl rounded-2xl">
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
                className="flex-1 h-12 px-4 text-gray-700 bg-gray-100/50 hover:bg-gray-200/50 backdrop-blur-sm border border-gray-200 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDialog(false);
                  doSubmit();
                }}
                disabled={isSubmitting}
                className="flex-1 h-12 px-4 text-white bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
    </div>
  );
}

function FormHeader() {
  return (
    <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -ml-16 -mb-16" />
      <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-3 relative z-10">
        <DocumentIcon />
        บันทึกรายงานประจำวัน
      </h1>
    </div>
  );
}

function PickerTrigger({
  onClick,
  label,
  placeholder,
  hoverColor,
}: {
  onClick: () => void;
  label?: string;
  placeholder: string;
  hoverColor: "emerald" | "blue";
}) {
  const hoverClass = hoverColor === "emerald" ? "hover:border-emerald-400" : "hover:border-blue-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full h-12 px-4 flex items-center justify-between bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base ${hoverClass} transition-all`}
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
        w-full h-14 flex items-center justify-center gap-2
        text-lg font-bold text-white rounded-xl
        transition-all duration-300
        ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl active:scale-[0.98]"
        }
      `}
    >
      {isSubmitting ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          กำลังบันทึก...
        </>
      ) : (
        <>
          <CheckIcon />
          บันทึกข้อมูล
        </>
      )}
    </button>
  );
}
