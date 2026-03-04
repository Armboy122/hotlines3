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
            className="group flex flex-col items-center justify-center gap-3 p-8 bg-white/40 border-2 border-dashed border-gray-300/80 rounded-3xl cursor-pointer transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-50/60 hover:shadow-lg active:scale-[0.98]"
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
    <div className="group/preview relative rounded-3xl overflow-hidden border-2 border-transparent bg-emerald-50 shadow-sm hover:shadow-xl transition-all duration-300 p-1 animate-in zoom-in duration-300">
      {/* Background glow for preview */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 rounded-3xl" />
      
      <div className="relative w-full h-36 rounded-[1.25rem] overflow-hidden">
        <img
          src={pending.previewUrl}
          alt={`รูปที่ ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={handleClick}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-md text-red-500 rounded-full hover:bg-red-500 hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-90"
        aria-label="ลบรูป"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      {/* Image Number Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs font-bold tracking-wide rounded-xl shadow-sm">
        FILE {index + 1}
      </div>
    </div>
  );
});

function UploadIdleState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full animate-in fade-in zoom-in duration-300">
      <div className="relative w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        {/* Glow behind */}
        <div className="absolute inset-0 bg-emerald-300/40 rounded-full blur-xl group-hover:bg-emerald-400/50 transition-colors duration-500" />
        
        {/* Main circle */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-[1.25rem] shadow-inner border border-white/80 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-emerald-600 transition-transform duration-300 group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        
        {/* Floating plus badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[0.95rem] font-bold text-slate-800">แตะเพื่ออัปโหลดรูปภาพ</span>
        <span className="text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-2 py-0.5 rounded-md">JPG, PNG • MAX 5MB</span>
      </div>
    </div>
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
