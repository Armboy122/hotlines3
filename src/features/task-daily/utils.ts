/**
 * Utility functions สำหรับ Task Daily Feature Module
 */

import type { PendingImage } from "./types";

// ========== Image Compression ==========
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const COMPRESSION_QUALITY = 0.8;

/**
 * บีบอัดรูปภาพให้มีขนาดเล็กลง
 * @param file - ไฟล์รูปภาพต้นฉบับ
 * @returns Promise<File> - ไฟล์รูปภาพที่บีบอัดแล้ว
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // คำนวณขนาดใหม่โดยรักษาสัดส่วน
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compress failed"));
              return;
            }
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          COMPRESSION_QUALITY
        );
      };

      img.onerror = () => reject(new Error("Load image failed"));
    };

    reader.onerror = () => reject(new Error("Read file failed"));
    reader.readAsDataURL(file);
  });
}

// ========== Validation ==========
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * ตรวจสอบข้อมูลฟอร์มก่อนส่ง
 */
export function validateFormData(form: {
  teamId: string;
  jobTypeId: string;
  jobDetailId: string;
  pendingBefore: PendingImage[];
}): ValidationResult {
  if (!form.teamId) {
    return { isValid: false, message: "กรุณาเลือกทีม" };
  }
  if (!form.jobTypeId) {
    return { isValid: false, message: "กรุณาเลือกประเภทงาน" };
  }
  if (!form.jobDetailId) {
    return { isValid: false, message: "กรุณาเลือกรายละเอียดงาน" };
  }
  if (form.pendingBefore.length === 0) {
    return { isValid: false, message: "กรุณาอัปโหลดรูปก่อนทำงานอย่างน้อย 1 รูป" };
  }
  return { isValid: true };
}

// ========== Helpers ==========
/**
 * แปลง empty string เป็น undefined สำหรับ optional fields
 */
export function emptyToUndefined<T>(value: T): T | undefined {
  if (value === "" || value === null) return undefined;
  return value;
}
