'use client';

import {
  BarChart3,
  Box,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import type { FeatureFlags } from '@/lib/features';

type FeatureKey = keyof FeatureFlags | null;

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  feature: FeatureKey;
  variant?: 'default' | 'destructive';
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, feature: null },
  { title: 'Productos', href: '/products', icon: Package, feature: 'products' },
  { title: 'Vendedores', href: '/sellers', icon: Users, feature: 'sellers' },
  { title: 'Asignaciones', href: '/assignments', icon: ClipboardList, feature: 'assignments' },
  { title: 'Historial', href: '/history', icon: History, feature: 'history' },
  { title: 'Ventas', href: '/sales', icon: ShoppingCart, feature: 'sales' },
  { title: 'Estadísticas', href: '/statistics', icon: BarChart3, feature: 'statistics' },
];

const footerNavItems: NavItem[] = [
  { title: 'Configuración', href: '/settings', icon: Settings, feature: 'settings' },
  { title: 'Cerrar Sesión', href: '/logout', icon: LogOut, feature: null, variant: 'destructive' },
];

interface AppSidebarProps {
  features: FeatureFlags;
}

export function AppSidebar({ features }: AppSidebarProps) {
  const pathname = usePathname();

  const filteredMainNav = useMemo(
    () => mainNavItems.filter((item) => item.feature === null || features[item.feature]),
    [features],
  );

  const filteredFooterNav = useMemo(
    () => footerNavItems.filter((item) => item.feature === null || features[item.feature]),
    [features],
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 p-2 transition-all duration-200 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <Link
          href="/"
          className="flex h-full w-full items-center gap-2 rounded-md p-2 transition-all duration-200 hover:bg-sidebar-accent group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:hover:bg-transparent"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Box className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="text-sm font-bold text-sidebar-foreground whitespace-nowrap">Stocker</span>
            <span className="text-xs text-sidebar-foreground/60 whitespace-nowrap">Gestión de negocio</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-0" />

      <SidebarFooter>
        <SidebarMenu>
          {filteredFooterNav.map((item) => {
            const isActive = pathname === item.href;
            const isDestructive = item.variant === 'destructive';
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={isDestructive ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : ''}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
