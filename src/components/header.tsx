'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDesktopNavItems, isPathActive } from "@/config/navigation";
import { useAuthContext } from "@/lib/auth/auth-context";
import { getAdminRoleLabel } from "@/lib/auth/role-policy";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const navItems = getDesktopNavItems(user?.role);
  const adminRoleLabel = getAdminRoleLabel(user?.role);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[calc(4rem+env(safe-area-inset-top))] border-b border-white/60 bg-white/75 pt-[env(safe-area-inset-top)] shadow-[0_8px_30px_rgba(30,92,165,0.10)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-blue-600 to-sky-500 p-2 shadow-[0_10px_22px_rgba(37,99,235,0.25)]">
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
            <h1 className="text-xl font-black text-blue-950">
              Hotline
            </h1>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-blue-700">S3</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-4">
          <nav className="flex items-center gap-1 rounded-2xl border border-white/60 bg-white/55 p-1 shadow-inner backdrop-blur-xl" aria-label="เมนูหลักเดสก์ท็อป">
            {navItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-blue-800'
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
              <div className="hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/65 px-3 py-1.5 shadow-sm backdrop-blur-md sm:flex">
                <User className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-700">
                  {user.username}
                </span>
                {adminRoleLabel && (
                  <span className="rounded-lg border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                    {adminRoleLabel}
                  </span>
                )}
              </div>

              {/* Mobile: compact badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-2.5 py-1 shadow-sm sm:hidden">
                <div className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-xs font-bold text-slate-700">{user.username}</span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
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
