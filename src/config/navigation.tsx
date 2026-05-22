import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, FilePlus2, FileText, Phone, Settings, UsersRound } from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { canAccessMainNavigationItem } from '@/lib/auth/role-policy';

interface NavigationItem {
  href: string
  label: string
  mobileLabel?: string  // Optional shorter label for mobile
  icon?: ReactNode
  mobileOnly?: boolean
  desktopOnly?: boolean
}

/**
 * Main navigation items per Requirement B §B.4.
 *
 * Order: Planning → Large Work → Monthly Plan → Daily Report → รายงานการปฏิบัติงาน → Contacts → Admin
 * No legacy dashboard route. Default after login is /planning.
 * Admin is super_admin only.
 */
export const navigationItems: NavigationItem[] = [
  {
    href: "/planning",
    label: "แผนงาน",
    mobileLabel: "แผนงาน",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    href: "/large-work",
    label: "งานระดมทีม",
    mobileLabel: "ระดมทีม",
    icon: <UsersRound className="h-5 w-5" />,
  },
  {
    href: "/monthly-plan",
    label: "แผนเดือน",
    mobileLabel: "แผนเดือน",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: "/daily-report",
    label: "บันทึกงาน",
    mobileLabel: "บันทึก",
    icon: <FilePlus2 className="h-5 w-5" />,
  },
  {
    href: "/work-report",
    label: "รายงานการปฏิบัติงาน",
    mobileLabel: "รายงาน",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: "/contacts",
    label: "สมุดโทรศัพท์",
    mobileLabel: "โทรศัพท์",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    href: "/admin",
    label: "จัดการระบบ",
    mobileLabel: "จัดการ",
    icon: <Settings className="h-5 w-5" />,
  }
];

// Helper functions
export const getDesktopNavItems = (role?: UserRole | null) =>
  navigationItems.filter((item) => !item.mobileOnly && canAccessMainNavigationItem(role, item.href));
export const getMobileNavItems = (role?: UserRole | null) =>
  navigationItems.filter((item) => !item.desktopOnly && canAccessMainNavigationItem(role, item.href));

// Check if path is active
export const isPathActive = (currentPath: string, itemPath: string): boolean => {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
};
