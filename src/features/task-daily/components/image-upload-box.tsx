"use client";

import { useCallback, memo, useId } from "react";
import { ImagePlus, Plus, Upload, X } from "lucide-react";
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
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <ImagePlus className="h-4 w-4 text-blue-600" aria-hidden="true" />
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
            className="smart-home-panel group flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed border-sky-200/90 bg-white/55 p-7 transition-all duration-200 hover:border-blue-300 hover:bg-sky-50/70 active:scale-[0.99]"
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
    <div className="smart-home-card group/preview relative overflow-hidden p-1 animate-in zoom-in duration-300">
      <div className="relative h-36 w-full overflow-hidden rounded-xl">
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
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-red-500 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95"
        aria-label="ลบรูป"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Image Number Badge */}
      <div className="absolute bottom-3 left-3 rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm backdrop-blur-md">
        FILE {index + 1}
      </div>
    </div>
  );
});

function UploadIdleState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full animate-in fade-in zoom-in duration-300">
      <div className="relative flex h-16 w-16 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-blue-50 to-sky-100 shadow-inner">
          <Upload className="h-8 w-8 text-blue-600 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>
        
        {/* Floating plus badge */}
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border-[3px] border-white bg-blue-500 text-white shadow-lg shadow-blue-500/30">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[0.95rem] font-bold text-slate-800">แตะเพื่ออัปโหลดรูปภาพ</span>
        <span className="text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-2 py-0.5 rounded-md">JPG, PNG • MAX 5MB</span>
      </div>
    </div>
  );
}

export const ImageUploadBox = memo(ImageUploadBoxComponent);
