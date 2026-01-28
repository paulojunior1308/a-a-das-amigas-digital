import { useState } from "react";
import { useOrders, Order } from "@/contexts/OrdersContext";
import { KitchenOrderCard } from "@/components/kitchen/KitchenOrderCard";
import { KitchenOrderModal } from "@/components/kitchen/KitchenOrderModal";
import { ChefHat, Tv, Store, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKitchenNotification } from "@/hooks/useKitchenNotification";

export default function Kitchen() {
  const { orders, markAsReady } = useOrders();
  
  // Play notification sound when new orders arrive
  useKitchenNotification(orders.length);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"all" | "balcao" | "comanda">("all");

  // Filter orders based on selected tab
  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.orderType === filter;
  });

  // Count by type
  const balcaoCount = orders.filter(o => o.orderType === "balcao").length;
  const comandaCount = orders.filter(o => o.orderType === "comanda").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-acai-yellow rounded-2xl flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-acai-purple-deep" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Cozinha</h1>
            <p className="text-acai-lilac">
              {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} em preparo
            </p>
          </div>
        </div>

        <Link to="/tv">
          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
          >
            <Tv className="w-5 h-5 mr-2" />
            Ver TV
          </Button>
        </Link>
      </header>

      {/* Filter Tabs */}
      <div className="mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:text-acai-purple-deep text-white"
            >
              Todos ({orders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="balcao" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-white"
            >
              <Store className="w-4 h-4 mr-1" />
              Balcão ({balcaoCount})
            </TabsTrigger>
            <TabsTrigger 
              value="comanda" 
              className="data-[state=active]:bg-acai-purple data-[state=active]:text-white text-white"
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Mesa ({comandaCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="w-24 h-24 bg-acai-lilac/20 rounded-full flex items-center justify-center mb-6">
            <ChefHat className="w-12 h-12 text-acai-lilac" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {filter === "all" 
              ? "Nenhum pedido no momento" 
              : filter === "balcao" 
                ? "Nenhum pedido de balcão"
                : "Nenhum pedido de mesa"}
          </h2>
          <p className="text-acai-lilac text-lg">
            Os pedidos aparecerão aqui automaticamente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredOrders.map((order, index) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              index={index}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <KitchenOrderModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onMarkReady={markAsReady}
      />
    </div>
  );
}
