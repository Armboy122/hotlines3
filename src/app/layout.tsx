import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        {/* Gradient Background with Decorative Orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />

          {/* Decorative floating orbs */}
          <div className="orb-green top-20 right-20 animation-delay-0" />
          <div className="orb-blue bottom-20 left-20 animation-delay-1000" />
          <div className="orb-yellow top-1/2 right-1/3 animation-delay-2000" />
          <div className="orb-purple bottom-1/3 right-1/4 animation-delay-3000" />
        </div>

        <Providers>
          {/* Header */}
          <Header />

          {/* Content */}
          <main className="pt-16 px-3 sm:px-4 lg:px-6 pb-24 md:pb-8 min-h-screen">
            {children}
          </main>

          {/* Navigation */}
          <Navbar />
        </Providers>
      </body>
    </html>
  );
}
