'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMobileNavItems, isPathActive } from "@/config/navigation";
import { useAuthContext } from "@/lib/auth/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const navItems = getMobileNavItems(user?.role);

  return (
    <nav
      aria-label="เมนูหลักมือถือ"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div
        className="mx-auto grid max-w-lg gap-1 px-2 py-2"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const isActive = isPathActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-1.5 text-center transition-colors duration-200 ${isActive
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {item.icon}
              </div>
              <span className="max-w-full truncate text-[11px] font-semibold leading-tight sm:text-xs">
                {item.mobileLabel || item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
