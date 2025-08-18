import { useState } from 'react';
import { FormData } from './useFormData';

export interface SubmitResponse {
  success: boolean;
  message: string;
  taskId?: string;
}

export const useSubmitTask = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate API submission - เตรียมไว้สำหรับ real API
  const submitTask = async (formData: FormData): Promise<SubmitResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with actual API call using Axios
      // const formDataToSend = new FormData();
      // formDataToSend.append('workDate', formData.workDate?.toISOString() || '');
      // formDataToSend.append('jobType', formData.jobType);
      // formDataToSend.append('jobDetail', formData.jobDetail);
      // 
      // if (formData.beforeImage) {
      //   formDataToSend.append('beforeImage', formData.beforeImage);
      // }
      // if (formData.afterImage) {
      //   formDataToSend.append('afterImage', formData.afterImage);
      // }
      //
      // const response = await axios.post('/api/tasks', formDataToSend, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      //
      // return response.data;

      // Mock delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log form data for testing
      console.log('Form Data Submitted:', {
        ...formData,
        workDate: formData.workDate?.toISOString(),
        beforeImage: formData.beforeImage ? 'File attached' : null,
        afterImage: formData.afterImage ? 'File attached' : null,
      });

      return {
        success: true,
        message: 'บันทึกข้อมูลสำเร็จ! 🎉',
        taskId: `TASK_${Date.now()}`
      };
      
    } catch {
      const errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitTask,
    isSubmitting,
    error,
    setError
  };
};