import { useState, useMemo } from "react";
import { useOrders, Order } from "@/contexts/OrdersContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  CreditCard,
  Check,
  Clock,
  ChefHat,
  Tv,
  Package,
  X,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoAcai from "@/assets/logo-acai.jpg";

export default function PDV() {
  const { orders, readyOrders, markAsReady, removeReadyOrder } = useOrders();
  const [selectedComanda, setSelectedComanda] = useState<number | null>(null);

  // Agrupar todos os pedidos (em preparo + prontos) por comanda
  const comandasAgrupadas = useMemo(() => {
    const allOrders = [...orders, ...readyOrders];
    const grouped = new Map<number, Order[]>();

    allOrders.forEach((order) => {
      const existing = grouped.get(order.comandaNumber) || [];
      grouped.set(order.comandaNumber, [...existing, order]);
    });

    return Array.from(grouped.entries())
      .map(([comandaNumber, ordersList]) => {
        const totalItems = ordersList.reduce(
          (sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0),
          0
        );
        const totalPrice = ordersList.reduce(
          (sum, order) =>
            sum +
            order.items.reduce((s, i) => s + i.product.price * i.quantity, 0),
          0
        );
        const allReady = ordersList.every((o) => o.status === "ready");
        const someReady = ordersList.some((o) => o.status === "ready");

        return {
          comandaNumber,
          orders: ordersList,
          totalItems,
          totalPrice,
          status: allReady ? "ready" : someReady ? "partial" : "preparing",
        };
      })
      .sort((a, b) => a.comandaNumber - b.comandaNumber);
  }, [orders, readyOrders]);

  const selectedComandaData = comandasAgrupadas.find(
    (c) => c.comandaNumber === selectedComanda
  );

  const handleFinalizarComanda = (comandaNumber: number) => {
    // Remove todos os pedidos prontos dessa comanda
    readyOrders
      .filter((o) => o.comandaNumber === comandaNumber)
      .forEach((o) => removeReadyOrder(o.id));
    
    setSelectedComanda(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img
            src={logoAcai}
            alt="Açaí das Amigas"
            className="w-14 h-14 rounded-xl object-cover shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">PDV</h1>
            <p className="text-acai-lilac">
              {comandasAgrupadas.length}{" "}
              {comandasAgrupadas.length === 1 ? "comanda ativa" : "comandas ativas"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/cozinha">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Cozinha
            </Button>
          </Link>
          <Link to="/tv">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Tv className="w-5 h-5 mr-2" />
              TV
            </Button>
          </Link>
        </div>
      </header>

      {/* Comandas Grid */}
      {comandasAgrupadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-24 h-24 bg-acai-lilac/20 rounded-full flex items-center justify-center mb-6">
            <Receipt className="w-12 h-12 text-acai-lilac" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Nenhuma comanda ativa
          </h2>
          <p className="text-acai-lilac text-lg">
            As comandas aparecerão aqui automaticamente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {comandasAgrupadas.map((comanda) => (
            <button
              key={comanda.comandaNumber}
              onClick={() => setSelectedComanda(comanda.comandaNumber)}
              className={cn(
                "relative w-full p-6 rounded-2xl transition-all duration-300 active:scale-95",
                "bg-card border-2 shadow-lg hover:shadow-xl",
                comanda.status === "ready"
                  ? "border-green-500"
                  : comanda.status === "partial"
                  ? "border-acai-yellow"
                  : "border-acai-lilac"
              )}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "absolute top-4 right-4 w-4 h-4 rounded-full",
                  comanda.status === "ready"
                    ? "bg-green-500"
                    : comanda.status === "partial"
                    ? "bg-acai-yellow animate-pulse"
                    : "bg-acai-lilac animate-pulse"
                )}
              />

              {/* Comanda number */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-medium">Comanda</span>
                </div>
                <span className="text-5xl font-bold text-acai-purple-deep">
                  #{comanda.comandaNumber.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Status badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4",
                  comanda.status === "ready"
                    ? "bg-green-100 text-green-700"
                    : comanda.status === "partial"
                    ? "bg-acai-yellow/20 text-acai-yellow-dark"
                    : "bg-acai-lilac/30 text-acai-purple-deep"
                )}
              >
                {comanda.status === "ready" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Pronta para pagar
                  </>
                ) : comanda.status === "partial" ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Parcialmente pronto
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Em preparo
                  </>
                )}
              </div>

              {/* Info row */}
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">
                    {comanda.totalItems} {comanda.totalItems === 1 ? "item" : "itens"}
                  </span>
                </div>
                <span className="text-xl font-bold text-acai-purple-deep">
                  R$ {comanda.totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Comanda Detail Modal */}
      <Dialog open={!!selectedComanda} onOpenChange={() => setSelectedComanda(null)}>
        <DialogContent className="max-w-lg mx-auto bg-card border-2 border-acai-purple">
          {selectedComandaData && (
            <>
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-acai-purple" />
                    <DialogTitle className="text-3xl font-bold text-acai-purple-deep">
                      Comanda #{selectedComandaData.comandaNumber.toString().padStart(2, "0")}
                    </DialogTitle>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-semibold",
                      selectedComandaData.status === "ready"
                        ? "bg-green-100 text-green-700"
                        : "bg-acai-yellow/20 text-acai-yellow-dark"
                    )}
                  >
                    {selectedComandaData.status === "ready"
                      ? "Pronta"
                      : selectedComandaData.status === "partial"
                      ? "Parcial"
                      : "Em preparo"}
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[50vh] pr-4">
                <div className="space-y-4 py-4">
                  {selectedComandaData.orders.map((order) => (
                    <div key={order.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          Pedido às{" "}
                          {order.createdAt.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            order.status === "ready"
                              ? "bg-green-100 text-green-700"
                              : "bg-acai-yellow/20 text-acai-yellow-dark"
                          )}
                        >
                          {order.status === "ready" ? "Pronto" : "Preparando"}
                        </span>
                      </div>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-muted rounded-xl border border-border"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-foreground">
                                {item.product.name}
                              </h4>
                              {item.observation && (
                                <p className="text-sm text-acai-yellow-dark mt-1">
                                  {item.observation}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-acai-purple-deep bg-acai-lilac px-3 py-1 rounded-full">
                                x{item.quantity}
                              </span>
                              <p className="text-sm text-muted-foreground mt-2">
                                R${" "}
                                {(item.product.price * item.quantity)
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-4 border-t border-border space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-acai-purple-deep">
                    R$ {selectedComandaData.totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {/* Actions */}
                <Button
                  onClick={() => handleFinalizarComanda(selectedComandaData.comandaNumber)}
                  size="lg"
                  disabled={selectedComandaData.status !== "ready"}
                  className={cn(
                    "w-full h-16 text-xl font-bold rounded-xl",
                    selectedComandaData.status === "ready"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Check className="w-6 h-6 mr-2" />
                  {selectedComandaData.status === "ready"
                    ? "Finalizar e Cobrar"
                    : "Aguardando preparo..."}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
