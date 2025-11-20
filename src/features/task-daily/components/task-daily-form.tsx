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
import { LocationPicker } from "@/components/ui/location-picker";
import { toast } from "sonner";
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
import { type CreateTaskDailyData } from "@/types/task-daily";
import { useCreateTaskDaily } from "@/hooks/useQueries";
import type {
  JobTypeWithCount,
  JobDetailWithCount,
  FeederWithStation,
  Team,
} from "@/types/query-types";

interface TaskDailyFormProps {
  jobTypes: JobTypeWithCount[];
  jobDetails: JobDetailWithCount[];
  feeders: FeederWithStation[];
  teams: Team[];
}

export default function TaskDailyForm({
  jobTypes,
  jobDetails,
  feeders,
  teams,
}: TaskDailyFormProps) {
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
    latitude: undefined,
    longitude: undefined,
  });

  const [resetKey, setResetKey] = useState(0);

  const createTaskMutation = useCreateTaskDaily();

  // Filter job details based on selected job type, but include those with no specific job type
  const filteredJobDetails = formData.jobTypeId
    ? jobDetails.filter(
        (jd) =>
          !jd.jobTypeId || jd.jobTypeId.toString() === formData.jobTypeId
      )
    : jobDetails;

  // Notify when selected job type has no details
  useEffect(() => {
    if (formData.jobTypeId && filteredJobDetails.length === 0) {
      toast.info("ไม่พบรายละเอียดงาน", {
        description: "ประเภทงานที่เลือกไม่มีหัวข้อย่อยให้เลือก",
      });
    }
  }, [formData.jobTypeId, filteredJobDetails.length]); 

  // Reset form after successful submission
  useEffect(() => {
    if (createTaskMutation.isSuccess) {
      toast.success("บันทึกข้อมูลสำเร็จ", {
        description: "ข้อมูลและรูปภาพถูกบันทึกเรียบร้อยแล้ว",
        icon: <CheckCircle className="text-emerald-500" />,
      });

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
        latitude: undefined,
        longitude: undefined,
      });

      // เปลี่ยน key เพื่อ re-mount ImageUpload components (clear preview)
      setResetKey((prev) => prev + 1);

      // Scroll กลับไปด้านบน
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset mutation state after a short delay
      const timer = setTimeout(() => {
        createTaskMutation.reset();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [createTaskMutation.isSuccess, createTaskMutation]);

  useEffect(() => {
    if (createTaskMutation.isError) {
      toast.error("เกิดข้อผิดพลาด", {
        description: createTaskMutation.error?.message || "ไม่สามารถบันทึกข้อมูลได้",
      });
    }
  }, [createTaskMutation.isError, createTaskMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  const addImageUrl = (type: "before" | "after", url: string) => {
    if (!url) return;
    setFormData((prev) => {
      if (type === "before") {
        return { ...prev, urlsBefore: [...prev.urlsBefore, url] };
      } else {
        return { ...prev, urlsAfter: [...prev.urlsAfter, url] };
      }
    });
  };

  const removeImageUrl = (type: "before" | "after", index: number) => {
    setFormData((prev) => {
      if (type === "before") {
        return {
          ...prev,
          urlsBefore: prev.urlsBefore.filter((_, i) => i !== index),
        };
      } else {
        return {
          ...prev,
          urlsAfter: prev.urlsAfter.filter((_, i) => i !== index),
        };
      }
    });
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
                      setFormData((prev) => ({
                        ...prev,
                        workDate: e.target.value,
                      }))
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
                      setFormData((prev) => ({ ...prev, teamId: value }))
                    }
                  >
                    <SelectTrigger className="backdrop-blur-sm bg-white/50 hover:bg-white/70 border border-gray-200/50 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl h-12 transition-all duration-300">
                      <SelectValue placeholder="เลือกทีม" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
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
                    options={jobTypes.map((jt) => ({
                      value: jt.id.toString(),
                      label: jt.name,
                    }))}
                    value={formData.jobTypeId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        jobTypeId: value,
                        jobDetailId: "",
                      }))
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
                      setFormData((prev) => ({ ...prev, jobDetailId: value }))
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
                    options={feeders.map((f) => ({
                      value: f.id.toString(),
                      label: `${f.code} - ${f.station?.name}`,
                    }))}
                    value={formData.feederId || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, feederId: value }))
                    }
                    placeholder="เลือกฟีดเดอร์"
                    searchPlaceholder="ค้นหาฟีดเดอร์..."
                    emptyText="ไม่พบฟีดเดอร์"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="numPole"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Hash className="h-4 w-4 text-gray-600" />
                    หมายเลขเสา
                  </Label>
                  <Input
                    id="numPole"
                    type="text"
                    value={formData.numPole || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        numPole: e.target.value,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                        deviceCode: e.target.value,
                      }))
                    }
                    placeholder="เช่น ABS-001"
                    className="input-glass h-12 text-base rounded-xl"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                  <LocationPicker 
                    value={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                    onChange={(val) => setFormData(prev => ({ ...prev, latitude: val.lat, longitude: val.lng }))}
                  />
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
                    setFormData((prev) => ({ ...prev, detail: e.target.value }))
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
