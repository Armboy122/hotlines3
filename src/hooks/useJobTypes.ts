import { useState, useEffect } from 'react';

// Job types structure based on jobs.md
const mockJobTypeData = {
  'ธุรกิจเสริม': [
    'แก้จุดร้อนหน้าสัมผัส',
    'ฉีดน้ำล้างอุปกรณ์'
  ],
  'งานตามแผนปฏิบัติ': [
    'ฉีดน้ำสถานี',
    'ฉีดน้ำในระบบสายส่ง',
    'ฉีดน้ำในระบบจำหน่าย',
    'เปลี่ยนน็อตเป็นสนิม'
  ],
  'ซ่อมแซมและบำรุงรักษาอุปกรณ์ต่างๆ': [
    'แก้ไขสายชำรุด',
    'ABS ชำรุด',
    'LBS ชำรุด',
    'เปลี่ยนลูกถ้วยแรงสูง 115',
    'อุปกรณ์อื่นๆเปลี่ยนอุปกรณ์/ติดตั้ง',
    'แก้จุดร้อนหน้าสัมผัส'
  ],
  'แก้ไขสิ่งแปลกปลอมในระบบ': [
    'แก้ไขสิ่งแปลกปลอมในระบบ'
  ],
  'ตัดต้นไม้ใกล้แนวสาย': [
    'ตัดต้นไม้ใกล้แนวสาย'
  ],
  'ปลด/เชื่อมสาย': [
    'ปลด/เชื่อมสาย'
  ]
};

export type JobTypeData = typeof mockJobTypeData;

export const useJobTypes = () => {
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [jobTypeData, setJobTypeData] = useState<JobTypeData>(mockJobTypeData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call - เตรียมไว้สำหรับ real API
  const fetchJobTypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get('/api/job-types');
      // setJobTypeData(response.data);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setJobTypes(Object.keys(mockJobTypeData));
      setJobTypeData(mockJobTypeData);
    } catch {
      setError('Failed to fetch job types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobTypes();
  }, []);

  const getJobDetails = (jobType: string): string[] => {
    return jobTypeData[jobType as keyof JobTypeData] || [];
  };

  return {
    jobTypes,
    jobTypeData,
    loading,
    error,
    fetchJobTypes,
    getJobDetails
  };
};