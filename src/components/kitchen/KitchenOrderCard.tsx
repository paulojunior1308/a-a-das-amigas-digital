import { Order } from "@/contexts/OrdersContext";
import { cn } from "@/lib/utils";
import { Clock, Package, CreditCard } from "lucide-react";

interface KitchenOrderCardProps {
  order: Order;
  onClick: () => void;
}

export function KitchenOrderCard({ order, onClick }: KitchenOrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const minutesAgo = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full p-6 rounded-2xl transition-all duration-300 active:scale-95",
        "bg-card border-2 shadow-lg hover:shadow-xl",
        order.status === "preparing"
          ? "border-acai-yellow"
          : "border-green-500 bg-green-50"
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "absolute top-4 right-4 w-4 h-4 rounded-full animate-pulse",
          order.status === "preparing" ? "bg-acai-yellow" : "bg-green-500"
        )}
      />

      {/* Comanda number */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-medium">Comanda</span>
        </div>
        <span className="text-6xl font-bold text-acai-purple-deep">
          #{order.comandaNumber.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Status badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4",
          order.status === "preparing"
            ? "bg-acai-yellow/20 text-acai-yellow-dark"
            : "bg-green-100 text-green-700"
        )}
      >
        {order.status === "preparing" ? (
          <>
            <div className="w-2 h-2 bg-acai-yellow rounded-full animate-pulse" />
            Em preparo
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Pronto
          </>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <span className="text-lg font-medium">{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="text-lg font-medium">{minutesAgo} min</span>
        </div>
      </div>
    </button>
  );
}
