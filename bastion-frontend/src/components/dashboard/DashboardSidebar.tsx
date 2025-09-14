import { useState } from 'react';
import { Building2, Users, BarChart3, Layers3, FileText, Key } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Home',
    url: '/',
    icon: Building2,
  },
  {
    title: 'Customers',
    url: '/customers',
    icon: Users,
  },
  {
    title: 'Claims',
    url: '/claims',
    icon: Layers3,
  },
  {
    title: 'Products',
    url: '/top-products',
    icon: BarChart3,
  },
  {
    title: 'Categories',
    url: '/top-categories',
    icon: Layers3,
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="h-16 border-b border-sidebar-border flex items-center justify-center">
          <h2
            className={`font-bold text-sidebar-foreground ${
              collapsed ? 'text-xl' : 'text-xl px-6 w-full'
            }`}
          >
            {collapsed ? 'B' : 'Bastion'}
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-sm font-medium px-6 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={`w-full justify-start px-6 py-3 transition-colors rounded-md ${
                      isActive(item.url)
                        ? 'bg-slate-800 text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-slate-800/60'
                    }`}
                  >
                    <item.icon
                      className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`}
                    />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Developer API Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-sm font-medium px-6 py-2">
            Developer API
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/api-docs')}
                  className={`w-full justify-start px-6 py-3 transition-colors rounded-md ${
                    isActive('/api-docs')
                      ? 'bg-slate-800 text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`} />
                  {!collapsed && <span>API Docs</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/api-keys')}
                  className={`w-full justify-start px-6 py-3 transition-colors rounded-md ${
                    isActive('/api-keys')
                      ? 'bg-slate-800 text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-slate-800/60'
                  }`}
                >
                  <Key className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`} />
                  {!collapsed && <span>API Keys</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
