import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    maximumScale: 1,
    userScalable: false,
    themeColor: "#15803d",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >


        <Providers>
          {/* Header */}
          <Header />

          {/* Content */}
          <main className="pt-16 px-3 sm:px-4 lg:px-6 pb-24 md:pb-8 min-h-screen">
            {children}
          </main>

          {/* Navigation */}
          <Navbar />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
