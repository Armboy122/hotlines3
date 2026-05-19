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
    <div className="fixed top-0 left-0 right-0 z-50 h-[calc(4rem+env(safe-area-inset-top))] bg-white border-b border-slate-200 pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-700 shadow-sm">
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
            <h1 className="text-xl font-bold text-blue-950">
              Hotline
            </h1>
            <span className="text-sm font-semibold text-slate-500">S3</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-4">
          <nav className="flex items-center gap-2" aria-label="เมนูหลักเดสก์ท็อป">
            {navItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
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
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <User className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-medium text-slate-700">
                  {user.username}
                </span>
                {adminRoleLabel && (
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-100 rounded-md px-1.5 py-0.5">
                    {adminRoleLabel}
                  </span>
                )}
              </div>

              {/* Mobile: compact badge */}
              <div className="sm:hidden flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                <div className="w-2 h-2 bg-blue-700 rounded-full" />
                <span className="text-xs text-slate-700 font-semibold">{user.username}</span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
