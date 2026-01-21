"use client";

import { useCallback, memo, useId } from "react";
import Image from "next/image";
import { Toast } from "antd-mobile";
import { useUpload } from "@/hooks/useUpload";
import { compressImage } from "../utils";
import type { ImageUploadBoxProps } from "../types";

/**
 * Component สำหรับอัปโหลดรูปภาพ
 * รองรับการบีบอัดรูป และแสดง progress
 */
function ImageUploadBoxComponent({
  label,
  images,
  onAdd,
  onRemove,
  color = "emerald",
}: ImageUploadBoxProps) {
  const inputId = useId();
  const { upload, uploading, progress } = useUpload();
  const isEmerald = color === "emerald";

  // Handle file selection
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const compressed = await compressImage(file);
        const result = await upload(compressed);

        if (result.success && result.data) {
          onAdd(result.data.url);
          Toast.show({ content: "อัปโหลดสำเร็จ", icon: "success" });
        } else {
          Toast.show({ content: result.error || "อัปโหลดล้มเหลว", icon: "fail" });
        }
      } catch {
        Toast.show({ content: "เกิดข้อผิดพลาด", icon: "fail" });
      }

      // Reset input
      e.target.value = "";
    },
    [upload, onAdd]
  );

  // Handle remove image
  const handleRemove = useCallback(
    (index: number) => {
      onRemove(index);
    },
    [onRemove]
  );

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <ColorDot isEmerald={isEmerald} />
        {label}
      </label>

      {/* Existing Images */}
      {images.map((url, index) => (
        <ImagePreview
          key={`${url}-${index}`}
          url={url}
          index={index}
          isEmerald={isEmerald}
          onRemove={handleRemove}
        />
      ))}

      {/* Upload Button */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id={inputId}
      />
      <label
        htmlFor={inputId}
        className={`
          flex flex-col items-center justify-center gap-3 p-8
          border-2 border-dashed rounded-2xl cursor-pointer transition-all
          ${uploading
            ? (isEmerald ? "border-emerald-300 bg-emerald-50 cursor-wait" : "border-blue-300 bg-blue-50 cursor-wait")
            : (isEmerald ? "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50")
          }
        `}
      >
        {uploading ? (
          <UploadingState progress={progress} isEmerald={isEmerald} />
        ) : (
          <UploadIdleState isEmerald={isEmerald} />
        )}
      </label>
    </div>
  );
}

// ========== Sub Components ==========

const ColorDot = memo(function ColorDot({ isEmerald }: { isEmerald: boolean }) {
  return (
    <div className={isEmerald ? "w-2.5 h-2.5 rounded-full bg-emerald-500" : "w-2.5 h-2.5 rounded-full bg-blue-500"} />
  );
});

const ImagePreview = memo(function ImagePreview({
  url,
  index,
  isEmerald,
  onRemove,
}: {
  url: string;
  index: number;
  isEmerald: boolean;
  onRemove: (index: number) => void;
}) {
  const handleClick = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <div className={isEmerald
      ? "relative rounded-xl overflow-hidden border-2 border-emerald-200 bg-emerald-50/50"
      : "relative rounded-xl overflow-hidden border-2 border-blue-200 bg-blue-50/50"
    }>
      <Image
        src={url}
        alt={`รูปที่ ${index + 1}`}
        width={400}
        height={160}
        className="w-full h-36 object-cover"
      />

      {/* Remove Button */}
      <button
        type="button"
        onClick={handleClick}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all"
        aria-label="ลบรูป"
      >
        <CloseIcon />
      </button>

      {/* Image Number Badge */}
      <div className={isEmerald
        ? "absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg"
        : "absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg"
      }>
        รูปที่ {index + 1}
      </div>
    </div>
  );
});

function UploadingState({ progress, isEmerald }: { progress: number; isEmerald: boolean }) {
  return (
    <>
      <div className={isEmerald
        ? "w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
        : "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      } />
      <span className="text-sm font-medium text-gray-600">กำลังอัปโหลด... {progress}%</span>
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={isEmerald ? "h-full bg-emerald-500 transition-all" : "h-full bg-blue-500 transition-all"}
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}

function UploadIdleState({ isEmerald }: { isEmerald: boolean }) {
  return (
    <>
      <div className={isEmerald
        ? "w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center"
        : "w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center"
      }>
        <PlusIcon isEmerald={isEmerald} />
      </div>
      <span className="text-base font-semibold text-gray-700">แตะเพื่อเพิ่มรูป</span>
      <span className="text-xs text-gray-500">รองรับ JPG, PNG สูงสุด 5MB</span>
    </>
  );
}

// ========== Icons ==========

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ isEmerald }: { isEmerald: boolean }) {
  return (
    <svg
      className={isEmerald ? "w-8 h-8 text-emerald-500" : "w-8 h-8 text-blue-500"}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export const ImageUploadBox = memo(ImageUploadBoxComponent);
