import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  BarChart3,
  Layers3,
  FileText,
  Key,
  ChevronDown,
  ChevronRight,
  Settings as SettingsIcon,
} from 'lucide-react';
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
    title: 'Company Profile',
    url: '/',
    icon: Building2,
  },
  {
    title: 'Customers',
    url: '/customers',
    icon: Users,
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const [apiDocsOpen, setApiDocsOpen] = useState(
    location.pathname.startsWith('/api-docs')
  );
  const currentHash = location.hash || '#introduction';
  const [webhookDocsOpen, setWebhookDocsOpen] = useState(
    location.pathname.startsWith('/webhook-docs')
  );

  useEffect(() => {
    setApiDocsOpen(currentPath.startsWith('/api-docs'));
    setWebhookDocsOpen(currentPath.startsWith('/webhook-docs'));
  }, [currentPath]);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="h-16 border-b border-sidebar-border flex items-center justify-center">
          {collapsed ? (
            <img
              src="/LogoBas.svg"
              alt="Bastion Logo"
              className="h-8 w-8 text-sidebar-foreground"
            />
          ) : (
            <div className="flex items-center px-6 w-full">
              <img
                src="/LogoBas.svg"
                alt="Bastion Logo"
                className="h-8 w-8 mr-2 text-sidebar-foreground"
              />
              <h2 className="font-bold text-xl text-sidebar-foreground">
                Bastion
              </h2>
            </div>
          )}
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
            Developer Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    if (collapsed) {
                      navigate('/api-docs');
                      return;
                    }
                    setApiDocsOpen((v) => {
                      const next = !v;
                      if (next) {
                        navigate('/api-docs');
                        setWebhookDocsOpen(false);
                      }
                      return next;
                    });
                  }}
                  className={`w-full justify-start px-6 py-3 transition-colors rounded-md ${
                    isActive('/api-docs')
                      ? 'bg-slate-800 text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-slate-800/60'
                  }`}
                  aria-expanded={!collapsed ? apiDocsOpen : undefined}
                >
                  <FileText
                    className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>API Docs</span>
                      {apiDocsOpen ? (
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      ) : (
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      )}
                    </div>
                  )}
                </SidebarMenuButton>
                {/* Submenu for API Docs anchors with slide animation */}
                {!collapsed && (
                  <div
                    className={`mt-1 ml-10 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
                      apiDocsOpen
                        ? 'max-h-[800px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {[
                      { id: '#introduction', label: 'Introduction' },
                      { id: '#authentication', label: 'Authentication' },
                      { id: '#core-concepts', label: 'Core Concepts' },
                      { id: '#get-users-kyc_email', label: 'GET /users/{kyc_email}' },
                      { id: '#post-claims', label: 'POST /claims' },
                      { id: '#patch-claims-claim_id', label: 'PATCH /claims/{claim_id}' },
                      { id: '#analytics', label: 'Analytics' },
                      { id: '#api-best-practices', label: 'API Best Practices' },
                      { id: '#webhooks', label: 'Webhooks' },
                      { id: '#error-handling', label: 'Error Handling' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`text-left text-sm transition-colors ${
                          currentPath.startsWith('/api-docs') && currentHash === item.id
                            ? 'text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/90 hover:text-sidebar-foreground'
                        }`}
                        onClick={() => navigate(`/api-docs${item.id}`)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
              {/* Webhook Docs under Developer API */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    if (collapsed) {
                      navigate('/webhook-docs');
                      return;
                    }
                    setWebhookDocsOpen((v) => {
                      const next = !v;
                      if (next) {
                        navigate('/webhook-docs');
                        setApiDocsOpen(false);
                      }
                      return next;
                    });
                  }}
                  className={`w-full justify-start px-6 py-3 transition-colors rounded-md ${
                    isActive('/webhook-docs')
                      ? 'bg-slate-800 text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-slate-800/60'
                  }`}
                  aria-expanded={!collapsed ? webhookDocsOpen : undefined}
                >
                  <FileText
                    className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Webhook Docs</span>
                      {webhookDocsOpen ? (
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      ) : (
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      )}
                    </div>
                  )}
                </SidebarMenuButton>
                {!collapsed && (
                  <div
                    className={`mt-1 ml-10 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
                      webhookDocsOpen
                        ? 'max-h-[800px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {[
                      { id: '#introduction', label: 'Introduction' },
                      { id: '#outbound-webhooks', label: 'Outbound Webhooks' },
                      { id: '#verify-outbound', label: 'Verifying Outbound' },
                      { id: '#inbound-webhooks', label: 'Inbound Webhooks' },
                      { id: '#best-practices', label: 'Best Practices' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`text-left text-sm transition-colors ${
                          currentPath.startsWith('/webhook-docs') && currentHash === item.id
                            ? 'text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/90 hover:text-sidebar-foreground'
                        }`}
                        onClick={() => navigate(`/webhook-docs${item.id}`)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
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
                  <Key
                    className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`}
                  />
                  {!collapsed && <span>API Keys</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/webhooks')}
                  className={`w-full justify-start px-6 py-3 transition-colors rounded-md ${
                    isActive('/webhooks')
                      ? 'bg-slate-800 text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-slate-800/60'
                  }`}
                >
                  <Layers3
                    className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`}
                  />
                  {!collapsed && <span>Webhooks</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Footer Settings Action */}
        <div className="mt-auto px-4 pb-4">
          {/* Thin horizontal bar above settings */}
          <div className="h-px bg-white/10 mb-3" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate('/settings')}
                className={`w-full justify-start ${collapsed ? 'px-2' : 'px-6'} py-3 transition-colors rounded-md text-sidebar-foreground hover:bg-slate-800/60`}
              >
                <SettingsIcon className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`} />
                {!collapsed && <span>Settings</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
