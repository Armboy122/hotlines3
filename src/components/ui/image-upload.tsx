"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Card, CardContent } from "./card";
import { useUpload } from "@/hooks/useUpload";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string; // URL ของรูปที่มีอยู่แล้ว
  onChange: (url: string | null) => void; // callback เมื่อรูปเปลี่ยน
  label?: string;
  accept?: string;
  maxSize?: number; // ขนาดสูงสุดใน MB
  className?: string;
}

// ฟังก์ชัน compress รูปภาพก่อน upload
async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // คำนวณขนาดใหม่ โดยรักษา aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }

        // วาดรูปลงบน canvas
        ctx.drawImage(img, 0, 0, width, height);

        // แปลงเป็น blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob failed"));
              return;
            }

            // สร้าง File ใหม่จาก blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
}

export function ImageUpload({
  value,
  onChange,
  label = "อัพโหลดรูป",
  accept = "image/*",
  maxSize = 5,
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const { upload, uploading, progress } = useUpload();

  // Cleanup Object URL เมื่อ component unmount หรือเปลี่ยนรูป
  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // ตรวจสอบขนาดไฟล์
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ขนาดไฟล์ใหญ่เกินไป สูงสุด ${maxSize}MB`);
      return;
    }

    // Cleanup Object URL เก่า
    if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    // สร้าง preview ทันทีด้วย Object URL (ไม่ต้องรอ)
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setPreview(previewUrl);

    try {
      // Compress รูปก่อน upload (ใช้เวลาประมาณ 200-500ms)
      const compressedFile = await compressImage(file);

      // แสดงขนาดที่ลดลง
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      console.log(
        `🖼️ Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB`,
      );

      // อัพโหลดไฟล์ที่ compress แล้ว
      const result = await upload(compressedFile);

      if (result.success && result.data) {
        onChange(result.data.url);
        // เปลี่ยนจาก Object URL เป็น S3 URL
        if (
          previewUrlRef.current &&
          previewUrlRef.current.startsWith("blob:")
        ) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = result.data.url;
        setPreview(result.data.url);
      } else {
        setError(result.error || "การอัพโหลดล้มเหลว");
        // กลับไปใช้รูปเดิม
        if (
          previewUrlRef.current &&
          previewUrlRef.current.startsWith("blob:")
        ) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = value || null;
        setPreview(value || null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการประมวลผลรูปภาพ",
      );
      // กลับไปใช้รูปเดิม
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = value || null;
      setPreview(value || null);
    }

    // รีเซ็ต input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    // Cleanup Object URL
    if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
    setPreview(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div className="mt-2">
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {/* Preview Area */}
        {preview ? (
          <Card className="relative">
            <CardContent className="p-4">
              <div className="relative">
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-md"
                />

                {/* Loading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <div className="text-sm">กำลังอัพโหลด... {progress}%</div>
                      {/* Progress Bar */}
                      <div className="w-32 h-2 bg-gray-600 rounded-full mt-2">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Remove button */}
                {!uploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Upload Button */
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                disabled={uploading}
                className="w-full h-32 flex flex-col items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>กำลังอัพโหลด... {progress}%</span>
                    {/* Progress Bar */}
                    <div className="w-48 h-2 bg-gray-300 rounded-full mt-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8" />
                    <Upload className="h-6 w-6" />
                    <span>คลิกเพื่อเลือกรูป</span>
                    <span className="text-xs text-gray-600">
                      รองรับ JPG, PNG, WebP สูงสุด {maxSize}MB
                    </span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error message */}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
