'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CustomDropdown from './CustomDropdown';

// Mock data for work types and their details
const workTypeData = {
  'งานบำรุงรักษา': [
    'ตรวจสอบอุปกรณ์',
    'ทำความสะอาด',
    'เปลี่ยนอะไหล่',
    'ปรับแต่งค่า',
    'ทดสอบระบบ'
  ],
  'งานซ่อมแซม': [
    'ซ่อมฉุกเฉิน',
    'ซ่อมตามแผน',
    'แก้ไขปัญหา',
    'เปลี่ยนอุปกรณ์เสียหาย'
  ],
  'งานติดตั้ง': [
    'ติดตั้งอุปกรณ์ใหม่',
    'ติดตั้งระบบ',
    'ย้ายอุปกรณ์',
    'อัพเกรดระบบ'
  ],
  'งานสำรวจ': [
    'สำรวจพื้นที่',
    'ตรวจสอบสภาพ',
    'ประเมินความเสียหาย',
    'วัดค่าต่างๆ'
  ]
};

// Mock station codes
const mockStationCodes = [
  'ST001 - สถานีกลาง',
  'ST002 - สถานีเหนือ',
  'ST003 - สถานีใต้',
  'ST004 - สถานีตะวันออก',
  'ST005 - สถานีตะวันตก',
  'ST101 - สถานีย่อย 1',
  'ST102 - สถานีย่อย 2',
  'ST103 - สถานีย่อย 3'
];

interface FormData {
  date: string;
  workType: string;
  workDetail: string;
  beforeImage: File | null;
  afterImage: File | null;
  stationCode: string;
  feeder: string;
  equipmentCode: string;
  poleNumber: string;
  obstacles: string;
  suggestions: string;
}

export default function FromSubmit() {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    workType: '',
    workDetail: '',
    beforeImage: null,
    afterImage: null,
    stationCode: '',
    feeder: '',
    equipmentCode: '',
    poleNumber: '',
    obstacles: '',
    suggestions: ''
  });

  const [workDetails, setWorkDetails] = useState<string[]>([]);
  const [stationSuggestions, setStationSuggestions] = useState<string[]>([]);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [beforeImagePreview, setBeforeImagePreview] = useState<string>('');
  const [afterImagePreview, setAfterImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const beforeImageRef = useRef<HTMLInputElement>(null);
  const afterImageRef = useRef<HTMLInputElement>(null);

  // Update work details when work type changes
  useEffect(() => {
    if (formData.workType && workTypeData[formData.workType as keyof typeof workTypeData]) {
      setWorkDetails(workTypeData[formData.workType as keyof typeof workTypeData]);
      setFormData(prev => ({ ...prev, workDetail: '' }));
    } else {
      setWorkDetails([]);
    }
  }, [formData.workType]);

  // Filter station codes based on input
  useEffect(() => {
    if (formData.stationCode.length > 0) {
      const filtered = mockStationCodes.filter(station =>
        station.toLowerCase().includes(formData.stationCode.toLowerCase())
      ).slice(0, 5);
      setStationSuggestions(filtered);
      setShowStationDropdown(true);
    } else {
      setStationSuggestions([]);
      setShowStationDropdown(false);
    }
  }, [formData.stationCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') {
          setBeforeImagePreview(reader.result as string);
          setFormData(prev => ({ ...prev, beforeImage: file }));
        } else {
          setAfterImagePreview(reader.result as string);
          setFormData(prev => ({ ...prev, afterImage: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStationSelect = (station: string) => {
    setFormData(prev => ({ ...prev, stationCode: station }));
    setShowStationDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form Data:', formData);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          workType: '',
          workDetail: '',
          beforeImage: null,
          afterImage: null,
          stationCode: '',
          feeder: '',
          equipmentCode: '',
          poleNumber: '',
          obstacles: '',
          suggestions: ''
        });
        setBeforeImagePreview('');
        setAfterImagePreview('');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-pulse">
          <div className="bg-green-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">บันทึกข้อมูลสำเร็จ!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        

        {/* Date Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              วันที่
            </span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
          />
        </div>

        {/* Work Type and Detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <CustomDropdown
            value={formData.workType}
            onChange={(value) => setFormData(prev => ({ ...prev, workType: value }))}
            options={[
              { value: '', label: 'เลือกประเภทงาน' },
              ...Object.keys(workTypeData).map(type => ({
                value: type,
                label: type
              }))
            ]}
            placeholder="เลือกประเภทงาน"
            label="ประเภทงาน"
            icon={
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          {workDetails.length > 0 && (
            <div className="animate-fadeIn">
              <CustomDropdown
                value={formData.workDetail}
                onChange={(value) => setFormData(prev => ({ ...prev, workDetail: value }))}
                options={[
                  { value: '', label: 'เลือกรายละเอียดงาน' },
                  ...workDetails.map(detail => ({
                    value: detail,
                    label: detail
                  }))
                ]}
                placeholder="เลือกรายละเอียดงาน"
                label="รายละเอียดงาน"
                icon={
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
            </div>
          )}
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                รูปก่อนทำ
              </span>
            </label>
            <input
              ref={beforeImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'before')}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => beforeImageRef.current?.click()}
              className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
            >
              {beforeImagePreview ? (
                <Image src={beforeImagePreview} alt="Before" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-500">เพิ่มรูป</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                รูปหลังทำ
              </span>
            </label>
            <input
              ref={afterImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'after')}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => afterImageRef.current?.click()}
              className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
            >
              {afterImagePreview ? (
                <Image src={afterImagePreview} alt="After" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-500">เพิ่มรูป</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Station Code with Autocomplete */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              รหัสสถานี
            </span>
          </label>
          <input
            type="text"
            name="stationCode"
            value={formData.stationCode}
            onChange={handleInputChange}
            placeholder="พิมพ์เพื่อค้นหา..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {showStationDropdown && stationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {stationSuggestions.map((station, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleStationSelect(station)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 text-gray-900"
                >
                  {station}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feeder and Equipment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <CustomDropdown
              value={formData.feeder}
              onChange={(value) => setFormData(prev => ({ ...prev, feeder: value }))}
              options={[
                { value: '', label: 'ไม่ระบุ' },
                ...[...Array(10)].map((_, i) => ({
                  value: String(i + 1),
                  label: `ฟีดเดอร์ ${i + 1}`
                }))
              ]}
              placeholder="เลือกฟีดเดอร์"
              label="ฟีดเดอร์"
              icon={
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                รหัสอุปกรณ์
              </span>
            </label>
            <input
              type="text"
              name="equipmentCode"
              value={formData.equipmentCode}
              onChange={handleInputChange}
              placeholder="เช่น EQ-001"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Pole Number */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              เบอร์เสา
            </span>
          </label>
          <input
            type="text"
            name="poleNumber"
            value={formData.poleNumber}
            onChange={handleInputChange}
            placeholder="เช่น P-001"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Obstacles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              อุปสรรค
            </span>
          </label>
          <textarea
            name="obstacles"
            value={formData.obstacles}
            onChange={handleInputChange}
            rows={3}
            placeholder="ระบุอุปสรรคที่พบ (ถ้ามี)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              ข้อเสนอแนะ
            </span>
          </label>
          <textarea
            name="suggestions"
            value={formData.suggestions}
            onChange={handleInputChange}
            rows={3}
            placeholder="ข้อเสนอแนะเพิ่มเติม (ถ้ามี)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
              </svg>
              บันทึกข้อมูล
            </>
          )}
        </button>
      </form>
    </div>
  );
}
