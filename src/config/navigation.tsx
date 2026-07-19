import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, FilePlus2, FileText, Phone, Settings, UsersRound } from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { canAccessMainNavigationItem } from '@/lib/auth/role-policy';

export interface NavigationItem {
  href: string
  label: string
  mobileLabel?: string  // Optional shorter label for mobile
  icon?: ReactNode
  mobileOnly?: boolean
  desktopOnly?: boolean
  activePaths?: string[]
  children?: NavigationItem[]
}

/**
 * Main navigation items per Requirement B §B.4.
 *
 * The flat list powers mobile and permission checks. Desktop groups large-work and
 * monthly-plan under Planning so it has no more than five top-level destinations.
 * Admin is super_admin only.
 */
export const navigationItems: NavigationItem[] = [
  {
    href: "/daily-report",
    label: "งานวันนี้",
    mobileLabel: "งานวันนี้",
    icon: <FilePlus2 className="h-5 w-5" />,
  },
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
export const getDesktopNavItems = (role?: UserRole | null): NavigationItem[] => {
  const allowed = navigationItems.filter((item) => !item.mobileOnly && canAccessMainNavigationItem(role, item.href));
  const byHref = new Map(allowed.map((item) => [item.href, item]));
  const planningChildren = ['/large-work', '/monthly-plan']
    .map((href) => byHref.get(href))
    .filter((item): item is NavigationItem => Boolean(item));

  return [
    byHref.get('/daily-report'),
    byHref.get('/planning') && { ...byHref.get('/planning')!, activePaths: ['/planning', '/large-work', '/monthly-plan'], children: planningChildren },
    byHref.get('/work-report'),
    byHref.get('/contacts') && { ...byHref.get('/contacts')!, label: 'ข้อมูลติดต่อ' },
    byHref.get('/admin'),
  ].filter((item): item is NavigationItem => Boolean(item));
};
export const getMobileNavItems = (role?: UserRole | null) =>
  navigationItems.filter((item) => !item.desktopOnly && canAccessMainNavigationItem(role, item.href));

// Check if path is active
export const isPathActive = (currentPath: string, itemPath: string): boolean => {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
};

export const isNavigationItemActive = (currentPath: string, item: NavigationItem): boolean =>
  (item.activePaths ?? [item.href]).some((path) => isPathActive(currentPath, path));
