import { useOrders } from "@/contexts/OrdersContext";
import { TVOrderDisplay } from "@/components/tv/TVOrderDisplay";
import { ChefHat, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import logoAcai from "@/assets/logo-acai.jpg";

export default function TV() {
  const { readyOrders } = useOrders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track new orders for animation
  useEffect(() => {
    if (readyOrders.length > 0) {
      const latestOrder = readyOrders[readyOrders.length - 1];
      if (latestOrder.readyAt && Date.now() - latestOrder.readyAt.getTime() < 5000) {
        setNewOrderIds((prev) => new Set([...prev, latestOrder.id]));
        const timer = setTimeout(() => {
          setNewOrderIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(latestOrder.id);
            return newSet;
          });
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [readyOrders]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep p-8 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <img
            src={logoAcai}
            alt="Açaí das Amigas"
            className="w-20 h-20 rounded-2xl object-cover shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold text-white">Açaí das Amigas</h1>
            <p className="text-acai-lilac text-xl">Painel de Pedidos Prontos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl">
          <Clock className="w-8 h-8 text-acai-yellow" />
          <span className="text-4xl font-bold text-white font-mono">
            {formatTime(currentTime)}
          </span>
        </div>
      </header>

      {/* Ready Orders */}
      {readyOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-32 h-32 bg-acai-lilac/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <ChefHat className="w-16 h-16 text-acai-lilac" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Aguardando pedidos...
          </h2>
          <p className="text-acai-lilac text-2xl">
            Os pedidos prontos aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {readyOrders.map((order) => (
            <TVOrderDisplay
              key={order.id}
              order={order}
              isNew={newOrderIds.has(order.id)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-acai-purple-deep/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center gap-4 text-acai-lilac">
          <span className="text-lg">
            {readyOrders.length} {readyOrders.length === 1 ? "pedido pronto" : "pedidos prontos"}
          </span>
        </div>
      </footer>
    </div>
  );
}
