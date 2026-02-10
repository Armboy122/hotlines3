"use client";

import { useCallback, memo, useId } from "react";
import { compressImage } from "../utils";
import type { ImageUploadBoxProps, PendingImage } from "../types";

/**
 * Component สำหรับอัปโหลดรูปภาพ (deferred upload)
 * ไม่อัปโหลดทันที แต่เก็บ File + preview ไว้ก่อน
 */
function ImageUploadBoxComponent({
  label,
  images,
  onAdd,
  onRemove,
  maxImages,
}: ImageUploadBoxProps) {
  const inputId = useId();
  const canAddMore = images.length < maxImages;

  // Handle file selection
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        // Compress image
        const compressed = await compressImage(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(compressed);

        // Call onAdd with PendingImage (NO upload to S3)
        onAdd({ file: compressed, previewUrl });
      } catch {
        // Error handling - silently fail
      }

      // Reset input
      e.target.value = "";
    },
    [onAdd]
  );

  // Handle remove image
  const handleRemove = useCallback(
    (index: number) => {
      // Parent (task-daily-form) will handle URL.revokeObjectURL
      onRemove(index);
    },
    [onRemove]
  );

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        {label}
      </label>

      {/* Existing Images */}
      {images.map((pending, index) => (
        <ImagePreview
          key={`${pending.previewUrl}-${index}`}
          pending={pending}
          index={index}
          onRemove={handleRemove}
        />
      ))}

      {/* Upload Button - Hide when maxImages reached */}
      {canAddMore && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={inputId}
          />
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50"
          >
            <UploadIdleState />
          </label>
        </>
      )}
    </div>
  );
}

// ========== Sub Components ==========

const ImagePreview = memo(function ImagePreview({
  pending,
  index,
  onRemove,
}: {
  pending: PendingImage;
  index: number;
  onRemove: (index: number) => void;
}) {
  const handleClick = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-200 bg-emerald-50/50">
      <img
        src={pending.previewUrl}
        alt={`รูปที่ ${index + 1}`}
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
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg">
        รูปที่ {index + 1}
      </div>
    </div>
  );
});

function UploadIdleState() {
  return (
    <>
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <PlusIcon />
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

function PlusIcon() {
  return (
    <svg
      className="w-8 h-8 text-emerald-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export const ImageUploadBox = memo(ImageUploadBoxComponent);
