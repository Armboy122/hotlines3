import {
  createPresignedUploadUrl,
  generateUniqueFileName,
  isValidImageType,
} from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[Upload API] Request received");

    const body = await request.json();
    const fileName = body?.fileName as string | undefined;
    const fileType = body?.fileType as string | undefined;

    console.log("[Upload API] Parsed body:", { fileName, fileType });

    if (!fileName || !fileType) {
      console.error("[Upload API] Missing required fields");
      return NextResponse.json(
        { success: false, error: "fileName และ fileType จำเป็นต้องมี" },
        { status: 400 },
      );
    }

    if (!isValidImageType(fileType)) {
      console.error("[Upload API] Invalid file type:", fileType);
      return NextResponse.json(
        {
          success: false,
          error: "ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะรูปภาพ (JPG, PNG, WebP, GIF)",
        },
        { status: 400 },
      );
    }

    console.log("[Upload API] Generating unique filename...");
    const objectKey = generateUniqueFileName(fileName, "images/");
    console.log("[Upload API] Object key:", objectKey);

    console.log("[Upload API] Creating presigned URL...");
    const { uploadUrl, fileUrl } = await createPresignedUploadUrl(
      objectKey,
      fileType,
      3600, // 1 hour expiry
    );

    console.log("[Upload API] Presigned URL created successfully");
    console.log("[Upload API] File URL:", fileUrl);

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        fileKey: objectKey,
      },
    });
  } catch (error) {
    console.error("[Upload API] Error details:", error);
    console.error("[Upload API] Error stack:", error instanceof Error ? error.stack : "No stack");

    const errorMessage = error instanceof Error ? error.message : "ไม่สามารถสร้าง presigned URL ได้";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
