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

// Material-UI Icons
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RouteIcon from '@mui/icons-material/Route';

export default function FormShadcn() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 pb-32 max-w-2xl">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
            <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-8 h-8 text-white animate-pulse" />
                  <div>
                    <span className="font-semibold text-white block">บันทึกข้อมูลสำเร็จ! 🎉</span>
                    <span className="text-green-100 text-sm">ขอบคุณสำหรับการรายงานงาน</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Step 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h2 className="text-lg font-semibold text-gray-800">ข้อมูลพื้นฐาน</h2>
              {isBasicInfoComplete && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
            </div>

            {/* Date Input */}
            <Card className={cn(
              "border-2 transition-all duration-300",
              formData.workDate ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100" : "border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 hover:border-orange-400"
            )}>
              <CardContent className="p-6">
                <Label className="flex items-center gap-2 text-orange-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                  <EventIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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
                          ? "border-green-500 hover:border-green-600 text-green-800" 
                          : "border-orange-300 hover:bg-orange-50 hover:border-orange-400",
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

            {/* Job Type and Detail */}
            <Card className={cn(
              "border-2 transition-all duration-300",
              formData.jobType && formData.jobDetail ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100" : "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-slate-400"
            )}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm sm:text-base">
                    <BusinessIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    ประเภทงาน <span className="text-red-600">*</span>
                    {formData.jobType && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                  </Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleSelectChange('jobType', value)}>
                    <SelectTrigger className={cn(
                      "w-full bg-white transition-all duration-200",
                      formData.jobType 
                        ? "border-green-500 hover:border-green-600" 
                        : "border-slate-300 hover:border-slate-400 focus:border-slate-500 focus:ring-slate-200"
                    )}>
                      <SelectValue placeholder="🔧 เลือกประเภทงาน..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type} className="cursor-pointer hover:bg-slate-50">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.jobType && getJobDetails(formData.jobType).length > 0 && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm sm:text-base">
                      <AssignmentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      รายละเอียดงาน <span className="text-red-600">*</span>
                      {formData.jobDetail && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                    </Label>
                    <Select value={formData.jobDetail} onValueChange={(value) => handleSelectChange('jobDetail', value)}>
                      <SelectTrigger className={cn(
                        "w-full bg-white transition-all duration-200",
                        formData.jobDetail 
                          ? "border-green-500 hover:border-green-600" 
                          : "border-slate-300 hover:border-slate-400 focus:border-slate-500 focus:ring-slate-200"
                      )}>
                        <SelectValue placeholder="📝 เลือกรายละเอียดงาน..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getJobDetails(formData.jobType).map((detail) => (
                          <SelectItem key={detail} value={detail} className="cursor-pointer hover:bg-slate-50">
                            {detail}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Location/Work-specific Information */}
          {shouldShowSpecificFields && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-white font-bold text-sm">2</div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {shouldShowStationSelect ? 'เลือกสถานี' : shouldShowLineSelect ? 'เลือกสายและระยะทาง' : 'ข้อมูลงาน'}
                </h2>
              </div>

              {/* Station Selection - for ฉีดน้ำสถานี */}
              {shouldShowStationSelect && (
                <Card className={cn(
                  "border-2 transition-all duration-300",
                  formData.planStationId ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100" : "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-slate-400"
                )}>
                  <CardContent className="p-6">
                    <Label className="flex items-center gap-2 text-slate-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                      <LocationOnIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      เลือกสถานี <span className="text-red-600">*</span>
                      {formData.planStationId && <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />}
                    </Label>
                    <Select value={formData.planStationId} onValueChange={(value) => handleSelectChange('planStationId', value)}>
                      <SelectTrigger className={cn(
                        "w-full bg-white transition-all duration-200",
                        formData.planStationId 
                          ? "border-green-500 hover:border-green-600" 
                          : "border-slate-300 hover:border-slate-400 focus:border-slate-500 focus:ring-slate-200"
                      )}>
                        <SelectValue placeholder="🏢 เลือกสถานี..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station} value={station} className="cursor-pointer hover:bg-slate-50">
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Line Selection + Distance - for ฉีดน้ำในระบบ */}
              {shouldShowLineSelect && (
                <div className="space-y-4">
                  <Card className={cn(
                    "border-2 transition-all duration-300",
                    formData.planLineId ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" : "border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300"
                  )}>
                    <CardContent className="p-6">
                      <Label className="flex items-center gap-2 text-purple-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                        <RouteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        เลือกสาย <span className="text-red-500">*</span>
                        {formData.planLineId && <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />}
                      </Label>
                      <Select value={formData.planLineId} onValueChange={(value) => handleSelectChange('planLineId', value)}>
                        <SelectTrigger className={cn(
                          "w-full bg-white transition-all duration-200",
                          formData.planLineId 
                            ? "border-green-300 hover:border-green-400" 
                            : "border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-200"
                        )}>
                          <SelectValue placeholder="⚡ เลือกสายไฟฟ้า..." />
                        </SelectTrigger>
                        <SelectContent>
                          {lines.map((line: string) => (
                            <SelectItem key={line} value={line} className="cursor-pointer hover:bg-slate-50">
                              {line}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300 transition-colors duration-200">
                    <CardContent className="p-6">
                      <Label className="flex items-center gap-2 text-purple-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                        <RouteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        ระยะทาง (กม.) <span className="text-red-500">*</span>
                        {formData.distanceKm && <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="distanceKm"
                        value={formData.distanceKm}
                        onChange={handleInputChange}
                        placeholder="📏 เช่น 5.2"
                        className="bg-white border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-200 transition-all duration-200"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Technical Fields - for other job types */}
              {shouldShowTechnicalFields && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300 transition-colors duration-200">
                      <CardContent className="p-6">
                        <Label className="flex items-center gap-2 text-purple-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                          <ElectricBoltIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          ฟีดเดอร์
                        </Label>
                        <Select value={formData.feederId} onValueChange={(value) => handleSelectChange('feederId', value)}>
                          <SelectTrigger className="w-full bg-white border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-200 transition-all duration-200">
                            <SelectValue placeholder="⚡ เลือกฟีดเดอร์..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="cursor-pointer hover:bg-purple-50">ไม่ระบุ</SelectItem>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)} className="cursor-pointer hover:bg-purple-50">
                                ฟีดเดอร์ {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300 transition-colors duration-200">
                      <CardContent className="p-6">
                        <Label className="flex items-center gap-2 text-purple-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                          <DescriptionIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          เบอร์เสา
                        </Label>
                        <Input
                          type="text"
                          name="numPole"
                          value={formData.numPole}
                          onChange={handleInputChange}
                          placeholder="🗼 เช่น P-001"
                          className="bg-white border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-200 transition-all duration-200"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300 transition-colors duration-200">
                    <CardContent className="p-6">
                      <Label className="flex items-center gap-2 text-purple-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                        <CodeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        รหัสอุปกรณ์
                      </Label>
                      <Input
                        type="text"
                        name="deviceCode"
                        value={formData.deviceCode}
                        onChange={handleInputChange}
                        placeholder="🏷️ เช่น EQ-001"
                        className="bg-white border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-200 transition-all duration-200"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Images - Only show if work details are filled */}
          {shouldShowImages && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                <h2 className="text-lg font-semibold text-gray-800">ภาพประกอบงาน</h2>
                {(beforeImagePreview || afterImagePreview) && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                <span className="text-sm text-gray-500 ml-auto">บังคับ</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Image */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <Label className="flex items-center gap-2 text-green-700 mb-2 sm:mb-3 font-medium text-sm">
                      <ImageIcon className="w-4 h-4" />
                      📷 รูปก่อนทำงาน <span className="text-red-500">*</span>
                      {beforeImagePreview && <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />}
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
                      className="w-full h-32 sm:h-40 border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] group-hover:shadow-lg"
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
                          <AddIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-green-600">คลิกเพื่อถ่ายรูป</span>
                          <span className="text-xs text-green-500 mt-1">หรือเลือกจากแกลเลอรี่</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* After Image */}
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <Label className="flex items-center gap-2 text-orange-700 mb-2 sm:mb-3 font-medium text-sm">
                      <ImageIcon className="w-4 h-4" />
                      📸 รูปหลังทำงาน <span className="text-red-500">*</span>
                      {afterImagePreview && <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />}
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
                      className="w-full h-32 sm:h-40 border-2 border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] group-hover:shadow-lg"
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
                          <AddIcon className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-orange-600">คลิกเพื่อถ่ายรูป</span>
                          <span className="text-xs text-orange-500 mt-1">หรือเลือกจากแกลเลอรี่</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Additional Notes */}
          {shouldShowNotes && (
          <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">4</div>
              <h2 className="text-lg font-semibold text-gray-800">หมายเหตุเพิ่มเติม</h2>
              <span className="text-sm text-gray-500 ml-auto">เสริม</span>
            </div>

            {/* Obstacles */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <Label className="flex items-center gap-2 text-orange-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                  <WarningIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  ⚠️ อุปสรรคและปัญหา
                </Label>
                <Textarea
                  name="obstacles"
                  value={formData.obstacles}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="มีอุปสรรคหรือปัญหาในการทำงานหรือไม่? (ไม่บังคับ)"
                  className="bg-white border-orange-200 hover:border-orange-300 focus:border-orange-500 focus:ring-orange-200 resize-none transition-all duration-200"
                />
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <Label className="flex items-center gap-2 text-green-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">
                  <LightbulbIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  💡 ข้อเสนอแนะและคำแนะนำ
                </Label>
                <Textarea
                  name="suggestions"
                  value={formData.suggestions}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="มีข้อเสนอแนะหรือคำแนะนำในการปรับปรุงหรือไม่? (ไม่บังคับ)"
                  className="bg-white border-green-200 hover:border-green-300 focus:border-green-500 focus:ring-green-200 resize-none transition-all duration-200"
                />
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
                "w-full font-bold py-6 text-base sm:text-lg shadow-xl transition-all duration-300 transform active:scale-[0.98]",
                !isFormValid() 
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 hover:shadow-2xl hover:scale-[1.02]"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 mr-3 border-3 border-white border-t-transparent rounded-full" />
                  <span className="animate-pulse">🚀 กำลังบันทึก...</span>
                </div>
              ) : !isFormValid() ? (
                <div className="flex items-center justify-center opacity-60">
                  <SaveIcon className="w-5 h-5 mr-2" />
                  กรุณากรอกข้อมูลที่จำเป็น
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SaveIcon className="w-6 h-6 mr-3" />
                  🎯 บันทึกข้อมูลงาน
                </div>
              )}
            </Button>
            
            {!isFormValid() && (
              <p className="text-center text-sm text-gray-500 mt-2">
                ⚠️ กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}