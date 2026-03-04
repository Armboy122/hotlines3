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
  const [uploadProgress, setUploadProgress] = useState(0);
  const { upload } = useUpload();
  const createTaskMutation = useCreateTaskDaily();

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

  // ===== Submit Handlers =====

  // บันทึกข้อมูลจริง (parallel upload for better performance)
  const doSubmit = useCallback(async (formData: FormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const totalImages = formData.pendingBefore.length + formData.pendingAfter.length;

      // 1. อัปโหลดรูปก่อนทำงานไป S3 (Parallel)
      console.log('[doSubmit] Starting parallel upload for before images:', formData.pendingBefore.length);
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
      console.log('[doSubmit] Before images uploaded successfully:', urlsBefore.length);

      // อัปเดต progress หลังอัปโหลด before images
      const beforeProgress = Math.round((formData.pendingBefore.length / totalImages) * 50);
      setUploadProgress(10 + beforeProgress);

      // 2. อัปโหลดรูปหลังทำงานไป S3 (Parallel)
      console.log('[doSubmit] Starting parallel upload for after images:', formData.pendingAfter.length);

      const afterUploads = formData.pendingAfter.map(pending => upload(pending.file));
      const afterResults = await Promise.all(afterUploads);

      // ตรวจสอบว่าอัปโหลดสำเร็จหมดหรือไม่
      const failedAfter = afterResults.find(r => !r.success || !r.data);
      if (failedAfter) {
        toast.error("อัปโหลดรูปหลังทำงานล้มเหลว");
        return;
      }
      const urlsAfter = afterResults.map(r => r.data!.url);
      console.log('[doSubmit] After images uploaded successfully:', urlsAfter.length);

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
      };

      // 4. Mutate ผ่าน React Query (use mutateAsync to await result)
      setUploadProgress(80);
      console.log('[doSubmit] Saving to database...');
      await createTaskMutation.mutateAsync(submitData);

      // Success handling
      setUploadProgress(100);
      console.log('[doSubmit] Task saved successfully');
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
      <div key={resetKey} className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50">
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
                    value={form.teamId ? [form.teamId.toString()] : []}
                    onConfirm={(val) => updateForm("teamId", parseInt(val[0] as string, 10))}
                  >
                    {(_, actions) => (
                      <PickerTrigger
                        onClick={actions.open}
                        label={teams.find((t) => t.id === form.teamId)?.name}
                        placeholder="เลือกทีม"
                        hoverColor="emerald"
                      />
                    )}
                  </Picker>
                </div>
              </div>
            </SectionCard>

            {/* Section: ประเภทงาน */}
            <SectionCard icon={<BriefcaseIcon />} title="ประเภทงาน" color="emerald">
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
                        hoverColor="emerald"
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
            <SectionCard icon={<TextIcon />} title="รายละเอียดเพิ่มเติม" color="amber">
              <div>
                <FieldLabel>รายละเอียดงาน</FieldLabel>
                <input
                  type="text"
                  value={form.detail || ""}
                  onChange={(e) => updateForm("detail", e.target.value)}
                  placeholder="รายละเอียดงานเพิ่มเติม"
                  className="w-full h-12 px-4 bg-white/70 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
            </SectionCard>

            {/* Section: รูปภาพ */}
            <SectionCard icon={<CameraIcon />} title="รูปภาพประกอบ" color="emerald">
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
                  color="emerald"
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

        {/* Progress Indicator */}
        {isSubmitting && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-gray-900">
                  กำลังบันทึกข้อมูล... {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

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
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50/50">
      {/* Top Right Emerald */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] max-w-[500px] max-h-[500px] bg-emerald-300/20 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
      
      {/* Bottom Left Gray/Blue */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[300px] min-h-[300px] max-w-[600px] max-h-[600px] bg-teal-200/20 rounded-full blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
      
      {/* Middle Right Amber */}
      <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] min-w-[200px] min-h-[200px] max-w-[400px] max-h-[400px] bg-amber-300/10 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
    </div>
  );
}

function FormHeader() {
  return (
    <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-[2rem] p-8 mb-8 text-white shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] overflow-hidden border border-white/20">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" />
      
      {/* Decorative Orbs inside card */}
      <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl mix-blend-overlay" />
      <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-amber-400/20 rounded-full blur-2xl mix-blend-overlay" />
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        {/* Custom 3D-like Icon */}
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner flex items-center justify-center -mt-2">
          <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-black text-center tracking-tight drop-shadow-md">
            บันทึกรายงานประจำวัน
          </h1>
          <p className="text-emerald-100/90 text-sm font-bold tracking-[0.2em] mt-1.5 uppercase">
            Hotline System
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
  hoverColor,
}: {
  onClick: () => void;
  label?: string;
  placeholder: string;
  hoverColor: "emerald";
}) {
  const hoverClass = "hover:border-emerald-400";

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
        relative overflow-hidden w-full h-[3.5rem] sm:h-16 flex items-center justify-center gap-3
        text-lg font-black text-white rounded-2xl tracking-wide
        transition-all duration-300
        ${disabled
          ? "bg-slate-300 text-slate-500 cursor-not-allowed border-2 border-slate-200"
          : "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] active:shadow-md cursor-pointer"
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
          <svg className="w-6 h-6 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          ส่งรายงาน
        </>
      )}
    </button>
  );
}
