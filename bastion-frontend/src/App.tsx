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

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<CompanyProfile />} />
              <Route path="/customers" element={<UserList />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/top-products" element={<TopProducts />} />
              <Route path="/top-categories" element={<TopCategories />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/api-keys" element={<ApiKeys />} />
              <Route path="/webhooks" element={<Webhooks />} />
              <Route path="/webhook-docs" element={<WebhookDocs />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
