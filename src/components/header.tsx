'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDesktopNavItems, isNavigationItemActive, isPathActive } from "@/config/navigation";
import { useAuthContext } from "@/lib/auth/auth-context";
import { getAdminRoleLabel } from "@/lib/auth/role-policy";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const navItems = getDesktopNavItems(user?.role);
  const adminRoleLabel = getAdminRoleLabel(user?.role);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[calc(4rem+env(safe-area-inset-top))] border-b border-border bg-white pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-700 p-1.5">
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
            <h1 className="text-lg font-bold text-slate-950">
              Hotline
            </h1>
            <span className="text-xs font-semibold text-slate-500">S3</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-1" aria-label="เมนูหลักเดสก์ท็อป">
            {navItems.map((item) => {
              const isActive = isNavigationItemActive(pathname, item);
              const itemClassName = `inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`;
              if (item.children?.length) {
                return (
                  <details key={item.href} className="group relative">
                    <summary className={`${itemClassName} cursor-pointer list-none`} aria-current={isActive ? 'page' : undefined}>{item.label}</summary>
                    <div className="absolute left-0 top-full z-10 mt-2 grid min-w-52 gap-1 rounded-xl border border-border bg-white p-2 shadow-lg">
                      <Link href={item.href} className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">ภาพรวมแผนงาน</Link>
                      {item.children.map((child) => <Link key={child.href} href={child.href} aria-current={isPathActive(pathname, child.href) ? 'page' : undefined} className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{child.label}</Link>)}
                    </div>
                  </details>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={itemClassName}
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
              <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
                <User className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-700">
                  {user.username}
                </span>
                {adminRoleLabel && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    {adminRoleLabel}
                  </span>
                )}
              </div>

              {/* Mobile: compact badge */}
              <div className="flex items-center gap-1.5 sm:hidden">
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
