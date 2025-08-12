import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-indigo-100`}
      >
        {/* Header */}
        <div className="jun-header bg-blue-400 text-neutral-800 shadow-xl">
          <div className="container py-6">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold">HotlineS3</h1>
            </div>
            <p className="text-center text-neutral-800 mt-2 font-medium">
              ระบบจัดการข้อมูล
            </p>
          </div>
        </div>

        {/* Content */}
        <main className="min-h-screen pb-24">
          {children}
        </main>

        {/* Navigation */}
        <nav className="jun-dock fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl">
          <ul className="jun-dockMenu flex justify-around py-3">
            <li className="jun-dockMenuItem">
              <Link className="jun-dockMenuButton group flex flex-col items-center gap-2 px-6 py-1 rounded-xl transition-all duration-300 hover:bg-blue-50 active:scale-95" href={"/"}>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold group-hover:text-emerald-600 transition-colors">
                  บันทึกข้อมูล
                </span>
              </Link>
            </li>
            <li className="jun-dockMenuItem">
              <Link className="jun-dockMenuButton group flex flex-col items-center gap-2 px-6 py-1 rounded-xl transition-all duration-300 hover:bg-blue-50 active:scale-95" href={"/list"}>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold group-hover:text-purple-600 transition-colors">
                  ดูข้อมูล
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </body>
    </html>
  );
}