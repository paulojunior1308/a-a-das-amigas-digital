import { useOrders } from "@/contexts/OrdersContext";
import { TVOrderDisplay } from "@/components/tv/TVOrderDisplay";
import { Clock } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import logoAcai from "@/assets/logo-acai.jpg";

export default function TV() {
  const { readyOrders } = useOrders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Filter only comanda orders (not balcao - those are picked up directly at counter)
  const tvOrders = useMemo(() => {
    return readyOrders.filter(order => order.orderType === "comanda");
  }, [readyOrders]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track new orders for animation
  useEffect(() => {
    if (tvOrders.length > 0) {
      const latestOrder = tvOrders[tvOrders.length - 1];
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
  }, [tvOrders]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep overflow-hidden flex flex-col">
      {tvOrders.length === 0 ? (
        // Empty state: Only logo centered
        <div className="flex-1 flex flex-col items-center justify-center">
          <img
            src={logoAcai}
            alt="Açaí das Amigas"
            className="w-48 h-48 rounded-3xl object-cover shadow-2xl mb-8 animate-pulse-glow"
          />
          <h1 className="text-5xl font-bold text-white mb-2">Açaí das Amigas</h1>
          <p className="text-acai-lilac text-2xl">Aguardando pedidos...</p>
        </div>
      ) : (
        // Orders view
        <>
          {/* Header */}
          <header className="flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <img
                src={logoAcai}
                alt="Açaí das Amigas"
                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
              />
              <div>
                <h1 className="text-4xl font-bold text-white">Açaí das Amigas</h1>
                <p className="text-acai-lilac text-xl">Pedidos Prontos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl">
              <Clock className="w-8 h-8 text-acai-yellow" />
              <span className="text-4xl font-bold text-white font-mono">
                {formatTime(currentTime)}
              </span>
            </div>
          </header>

          {/* Ready Orders Grid */}
          <main className="flex-1 p-8 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {tvOrders.map((order) => (
                <TVOrderDisplay
                  key={order.id}
                  order={order}
                  isNew={newOrderIds.has(order.id)}
                />
              ))}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-acai-purple-deep/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-center gap-4 text-acai-lilac">
              <span className="text-lg">
                {tvOrders.length} {tvOrders.length === 1 ? "pedido pronto" : "pedidos prontos"}
              </span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
