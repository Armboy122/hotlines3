import { useState } from 'react';

export interface FormData {
  workDate: Date | undefined;
  jobType: string;
  jobDetail: string;
  
  // Station-specific fields
  planStationId: string;
  
  // Line-specific fields  
  planLineId: string;
  distanceKm: string;
  
  // Common fields
  feederId: string;
  numPole: string;
  deviceCode: string;
  beforeImage: File | null;
  afterImage: File | null;
  
  // Optional notes
  obstacles: string;
  suggestions: string;
}

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
    workDate: new Date(),
    jobType: '',
    jobDetail: '',
    planStationId: '',
    planLineId: '',
    distanceKm: '',
    feederId: '',
    numPole: '',
    deviceCode: '',
    beforeImage: null,
    afterImage: null,
    obstacles: '',
    suggestions: ''
  });

  // Progressive disclosure states
  const shouldShowStationSelect = formData.jobDetail === 'ฉีดน้ำสถานี';
  const shouldShowLineSelect = formData.jobDetail === 'ฉีดน้ำในระบบสายส่ง' || formData.jobDetail === 'ฉีดน้ำในระบบจำหน่าย';
  const shouldShowTechnicalFields = !shouldShowStationSelect && !shouldShowLineSelect && formData.jobDetail;

  const isBasicInfoComplete = formData.workDate && formData.jobType && formData.jobDetail;
  const shouldShowSpecificFields = isBasicInfoComplete && formData.jobDetail;
  const shouldShowImages = shouldShowSpecificFields && (
    (shouldShowStationSelect && formData.planStationId) ||
    (shouldShowLineSelect && formData.planLineId && formData.distanceKm) ||
    (shouldShowTechnicalFields)
  );
  const shouldShowNotes = shouldShowImages;

  // Validation logic
  const getRequiredFields = () => {
    const baseFields = ['workDate', 'jobType', 'jobDetail'];
    
    if (formData.jobDetail === 'ฉีดน้ำสถานี') {
      return [...baseFields, 'planStationId'];
    } else if (formData.jobDetail === 'ฉีดน้ำในระบบสายส่ง' || formData.jobDetail === 'ฉีดน้ำในระบบจำหน่าย') {
      return [...baseFields, 'planLineId', 'distanceKm'];
    }
    
    return baseFields;
  };

  const isFormValid = () => {
    const requiredFields = getRequiredFields();
    return requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const resetForm = () => {
    setFormData({
      workDate: new Date(),
      jobType: '',
      jobDetail: '',
      planStationId: '',
      planLineId: '',
      distanceKm: '',
      feederId: '',
      numPole: '',
      deviceCode: '',
      beforeImage: null,
      afterImage: null,
      obstacles: '',
      suggestions: ''
    });
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    setFormData,
    updateFormData,
    resetForm,
    isBasicInfoComplete,
    shouldShowSpecificFields,
    shouldShowImages,
    shouldShowNotes,
    shouldShowStationSelect,
    shouldShowLineSelect,
    shouldShowTechnicalFields,
    isFormValid,
    getRequiredFields
  };
};