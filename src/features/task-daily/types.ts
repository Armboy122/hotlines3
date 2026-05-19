/**
 * Types สำหรับ Task Daily Feature Module
 * แยกไฟล์เพื่อให้ง่ายต่อการ maintain และ reuse
 */

import type {
  JobTypeWithCount,
  JobDetailWithCount,
  FeederWithStation,
  Team,
} from "@/types/query-types";
import type { TaskDailySourceType } from "@/types/task-daily";

// ========== Pending Image ==========
export interface PendingImage {
  file: File;          // ไฟล์ที่ compress แล้ว
  previewUrl: string;  // Object URL สำหรับ preview
}

// ========== Picker Option ==========
export interface PickerOption {
  value: string;
  label: string;
}

// ========== Form Data ==========
export interface FormData {
  workDate: string;
  teamId: number;
  jobTypeId: number;
  jobDetailId: number;
  feederId: string;
  numPole: string;
  deviceCode: string;
  detail: string;
  pendingBefore: PendingImage[];
  pendingAfter: PendingImage[];
  latitude?: number;
  longitude?: number;
  sourceType?: TaskDailySourceType | null;
  sourceId?: number | null;
  largeWorkTaskId?: number | null;
}

// ========== Component Props ==========
export interface FormProps {
  jobTypes: JobTypeWithCount[];
  jobDetails: JobDetailWithCount[];
  feeders: FeederWithStation[];
  teams: Team[];
  initialPlanSource?: {
    sourceType: TaskDailySourceType;
    sourceId: number;
    workDate?: string;
  } | null;
}

export interface SearchablePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  title?: string;
  disabled?: boolean;
}

export interface ImageUploadBoxProps {
  label: string;
  images: PendingImage[];
  onAdd: (pending: PendingImage) => void;
  onRemove: (index: number) => void;
  maxImages: number;
  color?: "blue";
}

export interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (val: { lat: number; lng: number }) => void;
}

export interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  color: "blue" | "amber";
  children: React.ReactNode;
}

export interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

// ========== Constants ==========
export const INITIAL_FORM_STATE: FormData = {
  workDate: new Date().toISOString().split("T")[0],
  teamId: 0,
  jobTypeId: 0,
  jobDetailId: 0,
  feederId: "",
  numPole: "",
  deviceCode: "",
  detail: "",
  pendingBefore: [],
  pendingAfter: [],
  latitude: undefined,
  longitude: undefined,
  sourceType: null,
  sourceId: null,
  largeWorkTaskId: null,
};

export const SECTION_COLORS = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
} as const;
