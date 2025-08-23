'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMobileNavItems, isPathActive } from "@/config/navigation";

export default function Navbar(){
  const pathname = usePathname();
  const navItems = getMobileNavItems();

  return(
    <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t rounded-2xl border-blue-100 shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = isPathActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.mobileLabel || item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}