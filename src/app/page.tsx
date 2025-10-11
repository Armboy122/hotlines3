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
import { Calendar, Users, Briefcase, FileText, Zap, Hash, Wrench, AlignLeft, Camera, Save } from "lucide-react";
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
  // NOTE: ตอนนี้ไม่กรองเพราะข้อมูล JobDetail ยังไม่มี jobTypeId
  // TODO: อัปเดตข้อมูล JobDetail ให้มี jobTypeId แล้วเปิดการกรองใหม่
  const filteredJobDetails = typedJobDetails;

  // Debug logs
  console.log("All job details:", typedJobDetails.length);
  console.log("Selected jobTypeId:", formData.jobTypeId);

  // Reset form after successful submission
  useEffect(() => {
    if (createTaskMutation.isSuccess) {
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
    }
  }, [createTaskMutation.isSuccess]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <Card className="shadow-sm border-gray-200 bg-white">
        <CardHeader className="bg-green-500 text-white p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-center">
            บันทึกรายงานประจำวัน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ข้อมูลพื้นฐาน */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                ข้อมูลพื้นฐาน
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="workDate"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Calendar className="h-4 w-4 text-green-500" />
                    วันที่ทำงาน *
                  </Label>
                  <Input
                    id="workDate"
                    type="date"
                    value={formData.workDate}
                    onChange={(e) =>
                      setFormData({ ...formData, workDate: e.target.value })
                    }
                    className="h-11 sm:h-12 text-base border border-gray-200 focus:border-green-500 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="teamId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Users className="h-4 w-4 text-green-500" />
                    ทีม *
                  </Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teamId: value })
                    }
                  >
                    <SelectTrigger className="h-11 sm:h-12 w-full text-base border border-gray-200 focus:border-green-500 rounded-lg">
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                ประเภทงาน
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="jobTypeId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Briefcase className="h-4 w-4 text-green-500" />
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
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <FileText className="h-4 w-4 text-green-500" />
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                ข้อมูลสถานที่
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="feederId"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Zap className="h-4 w-4 text-green-500" />
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
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Hash className="h-4 w-4 text-green-500" />
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
                    className="h-11 sm:h-12 w-full text-base border border-gray-200 focus:border-green-500 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="deviceCode"
                    className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                  >
                    <Wrench className="h-4 w-4 text-green-500" />
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
                    className="h-11 sm:h-12 w-full text-base border border-gray-200 focus:border-green-500 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* รายละเอียดเพิ่มเติม */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                รายละเอียดเพิ่มเติม
              </h3>
              <div className="space-y-2">
                <Label
                  htmlFor="detail"
                  className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600"
                >
                  <AlignLeft className="h-4 w-4 text-green-500" />
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
                  className="h-11 sm:h-12 w-full text-base border border-gray-200 focus:border-green-500 rounded-lg"
                />
              </div>
            </div>

            {/* รูปภาพ */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                รูปภาพประกอบ
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600">
                    <Camera className="h-4 w-4 text-green-500" />
                    รูปภาพก่อนทำงาน
                  </Label>
                  <div className="space-y-3">
                    {formData.urlsBefore.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Before ${index + 1}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            รูปที่ {index + 1}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImageUrl("before", index)}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <ImageUpload
                      onChange={(url) => url && addImageUrl("before", url)}
                      label="เพิ่มรูปก่อนทำงาน"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-600">
                    <Camera className="h-4 w-4 text-green-500" />
                    รูปภาพหลังทำงาน
                  </Label>
                  <div className="space-y-3">
                    {formData.urlsAfter.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`After ${index + 1}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            รูปที่ {index + 1}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImageUrl("after", index)}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <ImageUpload
                      onChange={(url) => url && addImageUrl("after", url)}
                      label="เพิ่มรูปหลังทำงาน"
                    />
                  </div>
                </div>
              </div>
            </div>

            {createTaskMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">
                  {createTaskMutation.error?.message || 'เกิดข้อผิดพลาด'}
                </p>
              </div>
            )}
            {createTaskMutation.isSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 font-medium">บันทึกข้อมูลสำเร็จ</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                createTaskMutation.isPending ||
                formData.urlsBefore.length === 0 ||
                formData.urlsAfter.length === 0
              }
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {createTaskMutation.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
            {(formData.urlsBefore.length === 0 ||
              formData.urlsAfter.length === 0) && (
              <p className="text-sm text-center text-yellow-600 font-medium">
                กรุณาอัปโหลดรูปภาพก่อนและหลังทำงานอย่างน้อยรูปละ 1 รูป
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
