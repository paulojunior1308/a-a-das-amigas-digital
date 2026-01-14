import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { ComandaProvider } from "@/contexts/ComandaContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Cardapio from "./pages/Cardapio";
import Kitchen from "./pages/Kitchen";
import TV from "./pages/TV";
import PDV from "./pages/PDV";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OrdersProvider>
      <ComandaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/cardapio" element={<Cardapio />} />
              <Route path="/cozinha" element={<Kitchen />} />
              <Route path="/tv" element={<TV />} />
              <Route path="/pdv" element={<PDV />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ComandaProvider>
    </OrdersProvider>
  </QueryClientProvider>
);

export default App;
