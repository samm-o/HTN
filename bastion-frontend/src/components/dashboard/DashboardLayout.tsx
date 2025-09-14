import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 h-16 border-b border-border bg-card flex items-center justify-start px-6">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-6 bg-background overflow-y-auto scrollbar-none overscroll-none">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
