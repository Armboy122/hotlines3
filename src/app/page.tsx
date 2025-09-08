"use client";

import { useState } from "react";
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
import { type CreateTaskDailyData } from "@/lib/actions/task-daily";
import {
  useJobTypes,
  useJobDetails,
  useFeeders,
  useTeams,
} from "@/hooks/useQueries";
import { submitTaskDailyForm } from "@/lib/actions/task-daily-form";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: jobTypes = [] } = useJobTypes();
  const { data: jobDetails = [] } = useJobDetails();
  const { data: feeders = [] } = useFeeders();
  const { data: teams = [] } = useTeams();

  function onSubmit() {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
  }

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
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-0 backdrop-blur-sm p-4">
        <CardHeader className="bg-gradient-to-r from-blue-600 p-4 to-indigo-600 text-white rounded-lg">
          <CardTitle className="text-2xl font-semibold text-center">
            📋 บันทึกรายงานประจำวัน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form
            action={submitTaskDailyForm}
            onSubmit={onSubmit}
            className="space-y-6"
          >
            {/* Hidden inputs for form data */}
            <input type="hidden" name="workDate" value={formData.workDate} />
            <input type="hidden" name="teamId" value={formData.teamId} />
            <input type="hidden" name="jobTypeId" value={formData.jobTypeId} />
            <input
              type="hidden"
              name="jobDetailId"
              value={formData.jobDetailId}
            />
            <input
              type="hidden"
              name="feederId"
              value={formData.feederId || ""}
            />
            <input
              type="hidden"
              name="numPole"
              value={formData.numPole || ""}
            />
            <input
              type="hidden"
              name="deviceCode"
              value={formData.deviceCode || ""}
            />
            <input type="hidden" name="detail" value={formData.detail || ""} />
            <input
              type="hidden"
              name="urlsBefore"
              value={JSON.stringify(formData.urlsBefore)}
            />
            <input
              type="hidden"
              name="urlsAfter"
              value={JSON.stringify(formData.urlsAfter)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="workDate"
                  className="text-lg font-medium text-gray-700"
                >
                  📅 วันที่ทำงาน *
                </Label>
                <Input
                  id="workDate"
                  type="date"
                  value={formData.workDate}
                  onChange={(e) =>
                    setFormData({ ...formData, workDate: e.target.value })
                  }
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="teamId"
                  className="text-lg font-medium text-gray-700"
                >
                  👥 ทีม *
                </Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teamId: value })
                  }
                >
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="เลือกทีม" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team: any) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="jobTypeId"
                  className="text-lg font-medium text-gray-700"
                >
                  🔧 ประเภทงาน *
                </Label>
                <Select
                  value={formData.jobTypeId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      jobTypeId: value,
                      jobDetailId: "",
                    })
                  }
                >
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="เลือกประเภทงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((jt: any) => (
                      <SelectItem
                        key={jt.id.toString()}
                        value={jt.id.toString()}
                      >
                        {jt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="jobDetailId"
                  className="text-lg font-medium text-gray-700"
                >
                  📝 รายละเอียดงาน *
                </Label>
                <Select
                  value={formData.jobDetailId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jobDetailId: value })
                  }
                  disabled={!formData.jobTypeId}
                >
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg disabled:bg-gray-100">
                    <SelectValue placeholder="เลือกรายละเอียดงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobDetails.map((jd: any) => (
                      <SelectItem
                        key={jd.id.toString()}
                        value={jd.id.toString()}
                      >
                        {jd.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="feederId"
                  className="text-lg font-medium text-gray-700"
                >
                  ⚡ ฟีดเดอร์
                </Label>
                <Select
                  value={formData.feederId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, feederId: value })
                  }
                >
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="เลือกฟีดเดอร์" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeders.map((f: any) => (
                      <SelectItem key={f.id.toString()} value={f.id.toString()}>
                        {f.code} - {f.station?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="numPole"
                  className="text-lg font-medium text-gray-700"
                >
                  🏗️ หมายเลขเสา
                </Label>
                <Input
                  id="numPole"
                  type="text"
                  value={formData.numPole || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, numPole: e.target.value })
                  }
                  placeholder="เช่น 123/45"
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="deviceCode"
                  className="text-lg font-medium text-gray-700"
                >
                  🔧 รหัสอุปกรณ์
                </Label>
                <Input
                  id="deviceCode"
                  type="text"
                  value={formData.deviceCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceCode: e.target.value })
                  }
                  placeholder="เช่น ABS-001"
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="detail"
                className="text-lg font-medium text-gray-700"
              >
                📄 รายละเอียดเพิ่มเติม
              </Label>
              <Input
                id="detail"
                type="text"
                value={formData.detail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, detail: e.target.value })
                }
                placeholder="รายละเอียดงานเพิ่มเติม"
                className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-lg font-medium text-gray-700">
                  📸 รูปภาพก่อนทำงาน
                </Label>
                <div className="space-y-3">
                  {formData.urlsBefore.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Before ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
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
                        className="h-8 w-8 p-0"
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
                <Label className="text-lg font-medium text-gray-700">
                  📸 รูปภาพหลังทำงาน
                </Label>
                <div className="space-y-3">
                  {formData.urlsAfter.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`After ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
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
                        className="h-8 w-8 p-0"
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

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">❌ {error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 font-medium">✅ {success}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? "⏳ กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
