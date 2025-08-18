'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Custom Hooks
import { useFormData } from '@/hooks/useFormData';
import { useJobTypes } from '@/hooks/useJobTypes';
import { useStations, useLines } from '@/hooks/useStations';
import { useSubmitTask } from '@/hooks/useSubmitTask';

// Material-UI Icons - All Blue
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RouteIcon from '@mui/icons-material/Route';
import NotesIcon from '@mui/icons-material/Notes';

export default function FormMinimal() {
  // Custom Hooks
  const {
    formData,
    updateFormData,
    resetForm,
    isBasicInfoComplete,
    shouldShowSpecificFields,
    shouldShowImages,
    shouldShowNotes,
    shouldShowStationSelect,
    shouldShowLineSelect,
    shouldShowTechnicalFields,
    isFormValid
  } = useFormData();

  const { jobTypes, getJobDetails } = useJobTypes();
  const { stations } = useStations();
  const { lines } = useLines();
  const { submitTask, isSubmitting } = useSubmitTask();

  // Local state for UI
  const [beforeImagePreview, setBeforeImagePreview] = useState<string>('');
  const [afterImagePreview, setAfterImagePreview] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const beforeImageRef = useRef<HTMLInputElement>(null);
  const afterImageRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') {
          setBeforeImagePreview(reader.result as string);
          updateFormData({ beforeImage: file });
        } else {
          setAfterImagePreview(reader.result as string);
          updateFormData({ afterImage: file });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitTask(formData);
    
    if (result.success) {
      setShowSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        setBeforeImagePreview('');
        setAfterImagePreview('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 pb-32 max-w-4xl">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 left-4 right-4 z-50">
            <Card className="bg-white border border-green-500 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <span className="font-medium text-gray-900">บันทึกข้อมูลสำเร็จ</span>
                    <p className="text-gray-600 text-sm">ขอบคุณสำหรับการรายงานงาน</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">1</div>
              <h2 className="text-lg font-medium text-gray-900">ข้อมูลพื้นฐาน</h2>
              {isBasicInfoComplete && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
            </div>

            {/* Basic Info - 3 columns layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Input */}
              <Card className={cn(
                "border transition-all duration-200",
                formData.workDate ? "border-blue-500 bg-white" : "border-gray-200 bg-white hover:border-gray-300"
              )}>
                <CardContent className="p-4">
                  <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                    <EventIcon className="w-4 h-4" />
                    วันที่ทำงาน <span className="text-red-600">*</span>
                    {formData.workDate && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                  </Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white transition-all duration-200",
                          formData.workDate 
                            ? "border-blue-500 hover:border-blue-600 text-blue-800" 
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                          !formData.workDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.workDate ? format(formData.workDate, "dd MMMM yyyy", { locale: th }) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.workDate}
                        onSelect={(date) => {
                          updateFormData({ workDate: date });
                          setDateOpen(false);
                        }}
                        locale={th}
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Job Type */}
              <Card className={cn(
                "border transition-all duration-200",
                formData.jobType ? "border-blue-500 bg-white" : "border-gray-200 bg-white hover:border-gray-300"
              )}>
                <CardContent className="p-4">
                  <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                    <BusinessIcon className="w-4 h-4" />
                    ประเภทงาน <span className="text-red-600">*</span>
                    {formData.jobType && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                  </Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleSelectChange('jobType', value)}>
                    <SelectTrigger className={cn(
                      "w-full bg-white transition-all duration-200",
                      formData.jobType 
                        ? "border-blue-500 hover:border-blue-600" 
                        : "border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    )}>
                      <SelectValue placeholder="เลือกประเภทงาน..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type} className="cursor-pointer hover:bg-blue-50">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Job Detail */}
              <Card className={cn(
                "border transition-all duration-200",
                formData.jobDetail ? "border-blue-500 bg-white" : "border-gray-200 bg-white hover:border-gray-300"
              )}>
                <CardContent className="p-4">
                  {formData.jobType && getJobDetails(formData.jobType).length > 0 ? (
                    <>
                      <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                        <AssignmentIcon className="w-4 h-4" />
                        รายละเอียดงาน <span className="text-red-600">*</span>
                        {formData.jobDetail && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                      </Label>
                      <Select value={formData.jobDetail} onValueChange={(value) => handleSelectChange('jobDetail', value)}>
                        <SelectTrigger className={cn(
                          "w-full bg-white transition-all duration-200",
                          formData.jobDetail 
                            ? "border-blue-500 hover:border-blue-600" 
                            : "border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        )}>
                          <SelectValue placeholder="เลือกรายละเอียดงาน..." />
                        </SelectTrigger>
                        <SelectContent>
                          {getJobDetails(formData.jobType).map((detail) => (
                            <SelectItem key={detail} value={detail} className="cursor-pointer hover:bg-blue-50">
                              {detail}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-sm h-10">
                      <AssignmentIcon className="w-4 h-4" />
                      เลือกประเภทงานก่อน
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Step 2: Work Details */}
          {shouldShowSpecificFields && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">2</div>
                <h2 className="text-lg font-medium text-gray-900">
                  {shouldShowStationSelect ? 'เลือกสถานี' : shouldShowLineSelect ? 'เลือกสายและระยะทาง' : 'ข้อมูลงาน'}
                </h2>
              </div>

              {/* Station Selection */}
              {shouldShowStationSelect && (
                <Card className="border bg-white">
                  <CardContent className="p-4">
                    <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                      <LocationOnIcon className="w-4 h-4" />
                      เลือกสถานี <span className="text-red-600">*</span>
                      {formData.planStationId && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                    </Label>
                    <Select value={formData.planStationId} onValueChange={(value) => handleSelectChange('planStationId', value)}>
                      <SelectTrigger className="w-full bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="เลือกสถานี..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station} value={station} className="cursor-pointer hover:bg-blue-50">
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Line Selection + Distance */}
              {shouldShowLineSelect && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                        <RouteIcon className="w-4 h-4" />
                        เลือกสาย <span className="text-red-600">*</span>
                        {formData.planLineId && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                      </Label>
                      <Select value={formData.planLineId} onValueChange={(value) => handleSelectChange('planLineId', value)}>
                        <SelectTrigger className="w-full bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500">
                          <SelectValue placeholder="เลือกสายไฟฟ้า..." />
                        </SelectTrigger>
                        <SelectContent>
                          {lines.map((line: string) => (
                            <SelectItem key={line} value={line} className="cursor-pointer hover:bg-blue-50">
                              {line}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                        <RouteIcon className="w-4 h-4" />
                        ระยะทาง (กม.) <span className="text-red-600">*</span>
                        {formData.distanceKm && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="distanceKm"
                        value={formData.distanceKm}
                        onChange={handleInputChange}
                        placeholder="เช่น 5.2"
                        className="bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Technical Fields */}
              {shouldShowTechnicalFields && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border bg-white">
                      <CardContent className="p-4">
                        <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                          <ElectricBoltIcon className="w-4 h-4" />
                          ฟีดเดอร์
                        </Label>
                        <Select value={formData.feederId} onValueChange={(value) => handleSelectChange('feederId', value)}>
                          <SelectTrigger className="w-full bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="เลือกฟีดเดอร์..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="cursor-pointer hover:bg-blue-50">ไม่ระบุ</SelectItem>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)} className="cursor-pointer hover:bg-blue-50">
                                ฟีดเดอร์ {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    <Card className="border bg-white">
                      <CardContent className="p-4">
                        <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                          <DescriptionIcon className="w-4 h-4" />
                          เบอร์เสา
                        </Label>
                        <Input
                          type="text"
                          name="numPole"
                          value={formData.numPole}
                          onChange={handleInputChange}
                          placeholder="เช่น P-001"
                          className="bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border bg-white">
                    <CardContent className="p-4">
                      <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                        <CodeIcon className="w-4 h-4" />
                        รหัสอุปกรณ์
                      </Label>
                      <Input
                        type="text"
                        name="deviceCode"
                        value={formData.deviceCode}
                        onChange={handleInputChange}
                        placeholder="เช่น EQ-001"
                        className="bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Images */}
          {shouldShowImages && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">3</div>
                <h2 className="text-lg font-medium text-gray-900">ภาพประกอบงาน</h2>
                {(beforeImagePreview || afterImagePreview) && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                <span className="text-sm text-red-600 ml-auto">บังคับ</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Image */}
                <Card className="border bg-white">
                  <CardContent className="p-4">
                    <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                      <ImageIcon className="w-4 h-4" />
                      รูปก่อนทำงาน <span className="text-red-600">*</span>
                      {beforeImagePreview && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                    </Label>
                    <input
                      ref={beforeImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'before')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => beforeImageRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      {beforeImagePreview ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={beforeImagePreview} 
                            alt="รูปก่อนทำงาน" 
                            fill
                            className="object-cover rounded-md" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <span className="text-white opacity-0 hover:opacity-100 transition-opacity font-medium text-sm bg-black bg-opacity-50 px-2 py-1 rounded">คลิกเพื่อเปลี่ยน</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <AddIcon className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-sm font-medium text-blue-600">คลิกเพื่อถ่ายรูป</span>
                          <span className="text-xs text-gray-500 mt-1">หรือเลือกจากแกลเลอรี่</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* After Image */}
                <Card className="border bg-white">
                  <CardContent className="p-4">
                    <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                      <ImageIcon className="w-4 h-4" />
                      รูปหลังทำงาน <span className="text-red-600">*</span>
                      {afterImagePreview && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                    </Label>
                    <input
                      ref={afterImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'after')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => afterImageRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      {afterImagePreview ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={afterImagePreview} 
                            alt="รูปหลังทำงาน" 
                            fill
                            className="object-cover rounded-md" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <span className="text-white opacity-0 hover:opacity-100 transition-opacity font-medium text-sm bg-black bg-opacity-50 px-2 py-1 rounded">คลิกเพื่อเปลี่ยน</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <AddIcon className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-sm font-medium text-blue-600">คลิกเพื่อถ่ายรูป</span>
                          <span className="text-xs text-gray-500 mt-1">หรือเลือกจากแกลเลอรี่</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Notes */}
          {shouldShowNotes && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">4</div>
                <h2 className="text-lg font-medium text-gray-900">หมายเหตุเพิ่มเติม</h2>
                <span className="text-sm text-gray-500 ml-auto">เสริม</span>
              </div>

              <Card className="border bg-white">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                      <NotesIcon className="w-4 h-4" />
                      อุปสรรคและปัญหา
                    </Label>
                    <Textarea
                      name="obstacles"
                      value={formData.obstacles}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="มีอุปสรรคหรือปัญหาในการทำงานหรือไม่? (ไม่บังคับ)"
                      className="bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-blue-600 mb-2 font-medium text-sm">
                      <NotesIcon className="w-4 h-4" />
                      ข้อเสนอแนะและคำแนะนำ
                    </Label>
                    <Textarea
                      name="suggestions"
                      value={formData.suggestions}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="มีข้อเสนอแนะหรือคำแนะนำในการปรับปรุงหรือไม่? (ไม่บังคับ)"
                      className="bg-white border-gray-200 hover:border-gray-300 focus:border-blue-500 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className={cn(
                "w-full font-medium py-6 text-base transition-all duration-200",
                !isFormValid() 
                  ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-500" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                  กำลังบันทึก...
                </div>
              ) : !isFormValid() ? (
                <div className="flex items-center justify-center">
                  <SaveIcon className="w-5 h-5 mr-2" />
                  กรุณากรอกข้อมูลที่จำเป็น
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SaveIcon className="w-5 h-5 mr-3" />
                  บันทึกข้อมูลงาน
                </div>
              )}
            </Button>
            
            {!isFormValid() && (
              <p className="text-center text-sm text-gray-500 mt-2">
                กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}