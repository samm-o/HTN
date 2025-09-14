import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import CompanyProfile from "./pages/CompanyProfile";
import TopProducts from "./pages/TopProducts";
import TopCategories from "./pages/TopCategories";
import Claims from "./pages/Claims";
import ApiDocs from "./pages/ApiDocs";
import ApiKeys from "./pages/ApiKeys";
import Webhooks from "./pages/Webhooks";
import WebhookDocs from "./pages/WebhookDocs";
import Settings from "./pages/Settings";
import UserList from "./pages/UserList";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public marketing landing page */}
            <Route path="/" element={<Landing />} />
            
            {/* Application dashboard routes wrapped in DashboardLayout */}
            <Route path="/dashboard" element={<DashboardLayout><CompanyProfile /></DashboardLayout>} />
            <Route path="/customers" element={<DashboardLayout><UserList /></DashboardLayout>} />
            <Route path="/claims" element={<DashboardLayout><Claims /></DashboardLayout>} />
            <Route path="/top-products" element={<DashboardLayout><TopProducts /></DashboardLayout>} />
            <Route path="/top-categories" element={<DashboardLayout><TopCategories /></DashboardLayout>} />
            <Route path="/api-docs" element={<DashboardLayout><ApiDocs /></DashboardLayout>} />
            <Route path="/api-keys" element={<DashboardLayout><ApiKeys /></DashboardLayout>} />
            <Route path="/webhooks" element={<DashboardLayout><Webhooks /></DashboardLayout>} />
            <Route path="/webhook-docs" element={<DashboardLayout><WebhookDocs /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<DashboardLayout><NotFound /></DashboardLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
