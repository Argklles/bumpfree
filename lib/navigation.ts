import type { LucideIcon } from "lucide-react";
import {
  DoorOpen,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { href: "/dashboard", label: "概览", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "我的课表", icon: User },
  { href: "/dashboard/rooms", label: "我的 Room", icon: DoorOpen },
  { href: "/dashboard/invitations", label: "邀请通知", icon: Mail },
  { href: "/dashboard/settings", label: "账号设置", icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/settings", label: "全站配置", icon: Shield },
];

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
