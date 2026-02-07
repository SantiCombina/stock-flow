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

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  { title: 'Cerrar Sesión', href: '/logout', icon: LogOut, feature: null },
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
      <SidebarHeader className="p-4 transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
        <Link href="/" className="flex items-center justify-center gap-3 group-data-[collapsible=icon]:gap-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary transition-all duration-200 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <Box className="h-6 w-6 text-primary-foreground transition-all duration-200 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
          </div>
          <div className="flex flex-col overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">Stocker</span>
            <span className="text-xs text-sidebar-foreground/60 whitespace-nowrap">Gestión de Inventario</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0" />

      <div className="overflow-hidden px-4 py-3 transition-all duration-200 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:opacity-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-sm font-medium text-sidebar-foreground">Administrador</span>
            <span className="text-xs text-sidebar-foreground/60">Dueño</span>
          </div>
        </div>
      </div>

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

      <SidebarFooter>
        <SidebarMenu>
          {filteredFooterNav.map((item) => {
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
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
