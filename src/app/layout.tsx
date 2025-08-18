import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/component/header";
import Navbar from "@/component/navbar";

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
  description: "Data Management System",
  icons: {
    icon: "/logoHL.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mx-auto max-w-md`}
      >
        {/* Header */}
        <Header/>

        {/* Content */}
        <main className="pt-40">
          {children}
        </main>

        {/* Navigation */}
        <Navbar/>
      </body>
    </html>
  );
}
