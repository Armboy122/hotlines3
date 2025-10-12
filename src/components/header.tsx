'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDesktopNavItems, isPathActive } from "@/config/navigation";

export default function Header() {
  const pathname = usePathname();
  const navItems = getDesktopNavItems();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg shadow-gray-900/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Logo Section with Glass Effect */}
        <div className="flex items-center gap-3">
          {/* Logo in gradient container */}
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <Image
              src="/logoHL.png"
              alt="Hotline Logo"
              width={32}
              height={32}
              className="rounded-lg"
              priority
              unoptimized
            />
          </div>
          <div className="flex items-baseline gap-1">
            <h1 className="text-xl font-bold text-gradient-green">
              Hotline
            </h1>
            <span className="text-sm font-semibold text-amber-500">S3</span>
          </div>
        </div>

        {/* Desktop Navigation with Glass States */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-4">
            {navItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-all duration-300 px-4 py-2.5 rounded-xl ${
                    isActive
                      ? 'backdrop-blur-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 shadow-md'
                      : 'text-gray-700 hover:backdrop-blur-sm hover:bg-gray-100/50 hover:text-emerald-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Status Badge with Glass Effect */}
        <div className="md:hidden flex items-center gap-2">
          <div className="backdrop-blur-sm bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-amber-700 font-semibold">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}