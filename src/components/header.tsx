'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDesktopNavItems, isPathActive } from "@/config/navigation";

export default function Header() {
  const pathname = usePathname();
  const navItems = getDesktopNavItems();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Image
            src="/logoHL.png"
            alt="Hotline Logo"
            width={40}
            height={40}
            className="rounded-lg"
            priority
            unoptimized
          />
          <div className="flex items-baseline">
            <h1 className="text-xl font-bold text-green-900">Hotline</h1>
            <span className="text-sm font-semibold text-yellow-500 ml-1">S3</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActive
                      ? 'text-green-900 bg-green-50 border-b-2 border-green-700'
                      : 'text-green-700 hover:text-green-900 hover:bg-green-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Status (visible on mobile only) */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-xs text-green-800 font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}