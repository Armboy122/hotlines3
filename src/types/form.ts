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

export type JobTypeData = {
  [key: string]: string[];
};

export interface ValidationState {
  isBasicInfoComplete: boolean;
  shouldShowSpecificFields: boolean;
  shouldShowImages: boolean;
  shouldShowNotes: boolean;
  shouldShowStationSelect: boolean;
  shouldShowLineSelect: boolean;
  shouldShowTechnicalFields: boolean;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  taskId?: string;
}

// Enum for better type safety
export enum JobDetailType {
  STATION_CLEANING = 'ฉีดน้ำสถานี',
  LINE_CLEANING_TRANSMISSION = 'ฉีดน้ำในระบบสายส่ง',
  LINE_CLEANING_DISTRIBUTION = 'ฉีดน้ำในระบบจำหน่าย'
}

export enum StepNumber {
  BASIC_INFO = 1,
  WORK_DETAILS = 2,
  IMAGES = 3,
  NOTES = 4
}