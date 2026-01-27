import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { ComandaProvider } from "@/contexts/ComandaContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { StockProvider } from "@/contexts/StockContext";
import { SalesProvider } from "@/contexts/SalesContext";
import { PortionsProvider } from "@/contexts/PortionsContext";
import Login from "./pages/Login";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminReports from "./components/admin/AdminReports";
import AdminStock from "./components/admin/AdminStock";
import AdminPortions from "./components/admin/AdminPortions";
import AdminPDV from "./components/admin/AdminPDV";
import Cardapio from "./pages/Cardapio";
import Kitchen from "./pages/Kitchen";
import TV from "./pages/TV";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProductsProvider>
      <StockProvider>
        <PortionsProvider>
          <SalesProvider>
            <OrdersProvider>
              <ComandaProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="relatorios" element={<AdminReports />} />
                        <Route path="estoque" element={<AdminStock />} />
                        <Route path="porcoes" element={<AdminPortions />} />
                        <Route path="pdv" element={<AdminPDV />} />
                      </Route>
                      <Route path="/cardapio" element={<Cardapio />} />
                      <Route path="/cozinha" element={<Kitchen />} />
                      <Route path="/tv" element={<TV />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </ComandaProvider>
            </OrdersProvider>
          </SalesProvider>
        </PortionsProvider>
      </StockProvider>
    </ProductsProvider>
  </QueryClientProvider>
);

export default App;
