import { NextRequest, NextResponse } from "next/server";
import {
  createPresignedUploadUrl,
  generateUniqueFileName,
  isValidImageType,
} from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fileName = body?.fileName as string | undefined;
    const fileType = body?.fileType as string | undefined;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, error: "fileName และ fileType จำเป็นต้องมี" },
        { status: 400 },
      );
    }

    if (!isValidImageType(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: "ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะรูปภาพ (JPG, PNG, WebP, GIF)",
        },
        { status: 400 },
      );
    }

    const objectKey = generateUniqueFileName(fileName, "images/");
    const { uploadUrl, fileUrl } = await createPresignedUploadUrl(
      objectKey,
      fileType,
    );

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        fileKey: objectKey,
      },
    });
  } catch (error) {
    console.error("Generate presigned URL error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถสร้าง presigned URL ได้",
      },
      { status: 500 },
    );
  }
}

