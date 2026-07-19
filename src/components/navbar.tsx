'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { getMobileNavItems, isPathActive } from "@/config/navigation";
import { useAuthContext } from "@/lib/auth/auth-context";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const [moreOpen, setMoreOpen] = useState(false);
  const navItems = getMobileNavItems(user?.role);
  const primaryHrefs = ["/daily-report", "/planning", "/work-report", "/contacts"];
  const primaryItems = primaryHrefs
    .map((href) => navItems.find((item) => item.href === href))
    .filter((item): item is (typeof navItems)[number] => Boolean(item));
  const overflowItems = navItems.filter((item) => !primaryHrefs.includes(item.href));
  const moreIsActive = overflowItems.some((item) => isPathActive(pathname, item.href));
  const visibleItems = overflowItems.length > 0 ? primaryItems.slice(0, 4) : primaryItems.slice(0, 5);

  return (
    <>
      <nav
        aria-label="เมนูหลักมือถือและแท็บเล็ต"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-sm lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1.5 px-2 py-2">
          {visibleItems.map((item) => {
            const isActive = isPathActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-center transition-colors duration-200 ${isActive
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {item.icon}
                </div>
                <span className="max-w-full text-[11px] font-semibold leading-tight sm:text-xs">
                  {item.mobileLabel || item.label}
                </span>
              </Link>
            );
          })}
          {overflowItems.length > 0 && (
            <button
              type="button"
              aria-current={moreIsActive ? 'page' : undefined}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              onClick={() => setMoreOpen(true)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-center transition-colors duration-200 ${moreIsActive
                ? 'bg-blue-50 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <MoreHorizontal className={`h-6 w-6 ${moreIsActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="max-w-full text-[11px] font-semibold leading-tight sm:text-xs">เพิ่มเติม</span>
            </button>
          )}
        </div>
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="rounded-t-xl border-border">
          <DrawerHeader className="flex-row items-center justify-between text-left">
            <DrawerTitle>เมนูเพิ่มเติม</DrawerTitle>
            <DrawerClose asChild>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="ปิดเมนูเพิ่มเติม"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="grid gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {overflowItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);
              return (
                <DrawerClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-lg border px-3 text-sm font-semibold ${isActive
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-border bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </DrawerClose>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
