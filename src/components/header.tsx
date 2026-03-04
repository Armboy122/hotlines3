'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDesktopNavItems, isPathActive } from "@/config/navigation";
import { useAuthContext } from "@/lib/auth/auth-context";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const navItems = getDesktopNavItems();
  const { user, logout } = useAuthContext();

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

        {/* User Info + Logout */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                <User className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">
                  {user.username}
                </span>
                {user.role === 'admin' && (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-700 rounded-md px-1.5 py-0.5">
                    Admin
                  </span>
                )}
              </div>

              {/* Mobile: compact badge */}
              <div className="sm:hidden flex items-center gap-1.5 backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs text-emerald-700 font-semibold">{user.username}</span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
