import { useState } from "react";
import { useOrders, Order } from "@/contexts/OrdersContext";
import { KitchenOrderCard } from "@/components/kitchen/KitchenOrderCard";
import { KitchenOrderModal } from "@/components/kitchen/KitchenOrderModal";
import { ChefHat, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Kitchen() {
  const { orders, markAsReady } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
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

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-24 h-24 bg-acai-lilac/20 rounded-full flex items-center justify-center mb-6">
            <ChefHat className="w-12 h-12 text-acai-lilac" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Nenhum pedido no momento
          </h2>
          <p className="text-acai-lilac text-lg">
            Os pedidos aparecerão aqui automaticamente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
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
