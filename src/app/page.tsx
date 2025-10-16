"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Combobox } from "@/components/ui/combobox";
import {
  Calendar,
  Users,
  Briefcase,
  FileText,
  Zap,
  Hash,
  Wrench,
  AlignLeft,
  Camera,
  Save,
  CheckCircle,
} from "lucide-react";
import { type CreateTaskDailyData } from "@/lib/actions/task-daily";
import {
  useJobTypes,
  useJobDetails,
  useFeeders,
  useTeams,
  useCreateTaskDaily,
} from "@/hooks/useQueries";
import type {
  JobTypeWithCount,
  JobDetailWithCount,
  FeederWithStation,
  Team,
} from "@/types/query-types";

export default function Home() {
  const [formData, setFormData] = useState<CreateTaskDailyData>({
    workDate: new Date().toISOString().split("T")[0],
    teamId: "",
    jobTypeId: "",
    jobDetailId: "",
    feederId: "",
    numPole: "",
    deviceCode: "",
    detail: "",
    urlsBefore: [],
    urlsAfter: [],
  });

  const [resetKey, setResetKey] = useState(0);

  const { data: jobTypes = [] } = useJobTypes();
  const { data: jobDetails = [] } = useJobDetails();
  const { data: feeders = [] } = useFeeders();
  const { data: teams = [] } = useTeams();

  const createTaskMutation = useCreateTaskDaily();

  // Type-safe arrays
  const typedJobTypes = jobTypes as JobTypeWithCount[];
  const typedJobDetails = jobDetails as JobDetailWithCount[];
  const typedFeeders = feeders as FeederWithStation[];
  const typedTeams = teams as Team[];

  // Filter job details based on selected job type
  const filteredJobDetails = typedJobDetails;

  // Reset form after successful submission
  useEffect(() => {
    if (createTaskMutation.isSuccess) {
      // Reset form data
      setFormData({
        workDate: new Date().toISOString().split("T")[0],
        teamId: "",
        jobTypeId: "",
        jobDetailId: "",
        feederId: "",
        numPole: "",
        deviceCode: "",
        detail: "",
        urlsBefore: [],
        urlsAfter: [],
      });

      // เปลี่ยน key เพื่อ re-mount ImageUpload components (clear preview)
      setResetKey((prev) => prev + 1);

      // Scroll กลับไปด้านบน
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto-hide success message หลัง 5 วินาที
      const timer = setTimeout(() => {
        createTaskMutation.reset();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [createTaskMutation.isSuccess, createTaskMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  const addImageUrl = (type: "before" | "after", url: string) => {
    if (!url) return;
    if (type === "before") {
      setFormData({ ...formData, urlsBefore: [...formData.urlsBefore, url] });
    } else {
      setFormData({ ...formData, urlsAfter: [...formData.urlsAfter, url] });
    }
  };

  const removeImageUrl = (type: "before" | "after", index: number) => {
    if (type === "before") {
      setFormData({
        ...formData,
        urlsBefore: formData.urlsBefore.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        urlsAfter: formData.urlsAfter.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <Card className="card-glass overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 sm:p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl -ml-24 -mb-24" />

          <CardTitle className="text-2xl sm:text-3xl font-bold text-center relative z-10 flex items-center justify-center gap-3">
            <Save className="h-7 w-7 sm:h-8 sm:w-8" />
            บันทึกรายงานประจำวัน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ข้อมูลพื้นฐาน */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="icon-glass-green p-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  ข้อมูลพื้นฐาน
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="workDate"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    วันที่ทำงาน *
                  </Label>
                  <Input
                    id="workDate"
                    type="date"
                    value={formData.workDate}
                    onChange={(e) =>
                      setFormData({ ...formData, workDate: e.target.value })
                    }
                    className="input-glass h-12 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="teamId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                    ทีม *
                  </Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teamId: value })
                    }
                  >
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 hover:bg-white/70 border border-gray-200/50 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl h-12 transition-all duration-300">
                      <SelectValue placeholder="เลือกทีม" />
                    </SelectTrigger>
                    <SelectContent>
                      {typedTeams.map((team) => (
                        <SelectItem
                          key={team.id.toString()}
                          value={team.id.toString()}
                        >
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ประเภทงาน */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="icon-glass-blue p-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  ประเภทงาน
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="jobTypeId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    ประเภทงาน *
                  </Label>
                  <Combobox
                    options={typedJobTypes.map((jt) => ({
                      value: jt.id.toString(),
                      label: jt.name,
                    }))}
                    value={formData.jobTypeId}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        jobTypeId: value,
                        jobDetailId: "",
                      })
                    }
                    placeholder="เลือกประเภทงาน"
                    searchPlaceholder="ค้นหาประเภทงาน..."
                    emptyText="ไม่พบประเภทงาน"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jobDetailId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <FileText className="h-4 w-4 text-purple-500" />
                    รายละเอียดงาน *
                  </Label>
                  <Combobox
                    options={filteredJobDetails.map((jd) => ({
                      value: jd.id.toString(),
                      label: jd.name,
                    }))}
                    value={formData.jobDetailId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, jobDetailId: value })
                    }
                    placeholder="เลือกรายละเอียดงาน"
                    searchPlaceholder="ค้นหารายละเอียดงาน..."
                    emptyText={
                      formData.jobTypeId
                        ? "ไม่พบรายละเอียดงานสำหรับประเภทงานนี้"
                        : "กรุณาเลือกประเภทงานก่อน"
                    }
                    disabled={!formData.jobTypeId}
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลสถานที่ */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="icon-glass-yellow p-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  ข้อมูลสถานที่
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="feederId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <Zap className="h-4 w-4 text-amber-500" />
                    ฟีดเดอร์
                  </Label>
                  <Combobox
                    options={typedFeeders.map((f) => ({
                      value: f.id.toString(),
                      label: `${f.code} - ${f.station?.name}`,
                    }))}
                    value={formData.feederId || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, feederId: value })
                    }
                    placeholder="เลือกฟีดเดอร์"
                    searchPlaceholder="ค้นหาฟีดเดอร์..."
                    emptyText="ไม่พบฟีดเดอร์"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="numPole"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <Hash className="h-4 w-4 text-gray-500" />
                    หมายเลขเสา
                  </Label>
                  <Input
                    id="numPole"
                    type="text"
                    value={formData.numPole || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, numPole: e.target.value })
                    }
                    placeholder="เช่น 123/45"
                    className="input-glass h-12 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="deviceCode"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                  >
                    <Wrench className="h-4 w-4 text-orange-500" />
                    รหัสอุปกรณ์
                  </Label>
                  <Input
                    id="deviceCode"
                    type="text"
                    value={formData.deviceCode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceCode: e.target.value })
                    }
                    placeholder="เช่น ABS-001"
                    className="input-glass h-12 text-base rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* รายละเอียดเพิ่มเติม */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="icon-glass-purple p-2">
                  <AlignLeft className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  รายละเอียดเพิ่มเติม
                </h3>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="detail"
                  className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700"
                >
                  <AlignLeft className="h-4 w-4 text-purple-500" />
                  รายละเอียดงาน
                </Label>
                <Input
                  id="detail"
                  type="text"
                  value={formData.detail || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, detail: e.target.value })
                  }
                  placeholder="รายละเอียดงานเพิ่มเติม"
                  className="input-glass h-12 text-base rounded-xl"
                />
              </div>
            </div>

            {/* รูปภาพ */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="icon-glass-orange p-2">
                  <Camera className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  รูปภาพประกอบ
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700">
                    <Camera className="h-4 w-4 text-emerald-500" />
                    รูปภาพก่อนทำงาน
                  </Label>
                  <div className="space-y-3">
                    {formData.urlsBefore.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 backdrop-blur-sm bg-emerald-50/50 border border-emerald-200 rounded-xl hover:shadow-md transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Before ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            รูปที่ {index + 1}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImageUrl("before", index)}
                          className="h-9 w-9 p-0 shrink-0 hover:scale-110 transition-transform"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <ImageUpload
                      key={`before-${resetKey}`}
                      onChange={(url) => url && addImageUrl("before", url)}
                      label="เพิ่มรูปก่อนทำงาน"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700">
                    <Camera className="h-4 w-4 text-blue-500" />
                    รูปภาพหลังทำงาน
                  </Label>
                  <div className="space-y-3">
                    {formData.urlsAfter.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 backdrop-blur-sm bg-blue-50/50 border border-blue-200 rounded-xl hover:shadow-md transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`After ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-blue-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            รูปที่ {index + 1}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImageUrl("after", index)}
                          className="h-9 w-9 p-0 shrink-0 hover:scale-110 transition-transform"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <ImageUpload
                      key={`after-${resetKey}`}
                      onChange={(url) => url && addImageUrl("after", url)}
                      label="เพิ่มรูปหลังทำงาน"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {createTaskMutation.isError && (
              <div className="backdrop-blur-sm bg-red-50/70 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xl">✕</span>
                </div>
                <p className="text-red-700 font-medium">
                  {createTaskMutation.error?.message || "เกิดข้อผิดพลาด"}
                </p>
              </div>
            )}
            {createTaskMutation.isSuccess && (
              <div className="backdrop-blur-md bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-5 shadow-lg shadow-emerald-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md animate-pulse">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                      บันทึกสำเร็จ!
                    </h4>
                    <p className="text-emerald-700 font-medium">
                      ข้อมูลและรูปภาพของคุณถูกบันทึกเรียบร้อยแล้ว
                    </p>
                    <p className="text-emerald-600 text-sm">
                      ✓ ฟอร์มได้รับการล้างข้อมูลแล้ว พร้อมสำหรับงานถัดไป
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <p className="text-xs text-emerald-600 text-center">
                    ข้อความนี้จะหายไปอัตโนมัติใน 5 วินาที
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                createTaskMutation.isPending || formData.urlsBefore.length === 0
              }
              className="w-full h-14 text-base sm:text-lg font-bold btn-gradient-green rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform"
            >
              <Save className="h-5 w-5 mr-2" />
              {createTaskMutation.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
            {formData.urlsBefore.length === 0 && (
              <div className="backdrop-blur-sm bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-amber-600">⚠️</span>
                <p className="text-sm text-amber-700 font-medium">
                  กรุณาอัปโหลดรูปภาพก่อนทำงาน (รูปหลังทำงานไม่บังคับ)
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
