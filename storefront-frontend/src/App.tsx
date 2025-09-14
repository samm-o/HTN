import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Index from './pages/Index';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import VerificationPending from './pages/VerificationPending';
import KYCPlatform from './pages/KYCPlatform';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/kyc-platform') {
      document.title = 'Verify ID';
    } else {
      document.title = 'StoreFront';
    }
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TitleUpdater />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route
            path="/verification-pending"
            element={<VerificationPending />}
          />
          <Route path="/kyc-platform" element={<KYCPlatform />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
