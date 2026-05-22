import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HotlineS3",
  description: "ระบบจัดการข้อมูลพื้นฐานสำหรับการไฟฟ้า",
  manifest: "/manifest.json",
  icons: {
    icon: "/logoHL.png",
    apple: "/apple-touch-icon.png",
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: "#1d4ed8",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${notoSansThai.variable} ${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
