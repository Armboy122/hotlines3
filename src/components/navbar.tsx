'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMobileNavItems, isPathActive } from "@/config/navigation";

export default function Navbar(){
  const pathname = usePathname();
  const navItems = getMobileNavItems();

  return(
    <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto backdrop-blur-xl bg-white/90 border-t border-white/30 shadow-2xl shadow-gray-900/10 rounded-t-3xl pb-safe">
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const isActive = isPathActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'backdrop-blur-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 shadow-md scale-105'
                  : 'text-gray-600 hover:backdrop-blur-sm hover:bg-gray-100/50 hover:text-emerald-600 hover:scale-105'
              }`}
            >
              <div className={`transition-colors duration-300 ${
                isActive ? 'text-emerald-600' : 'text-gray-600'
              }`}>
                {item.icon}
              </div>
              <span className="text-xs font-semibold">{item.mobileLabel || item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}