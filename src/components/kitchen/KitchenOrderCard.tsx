import { Order } from "@/contexts/OrdersContext";
import { cn } from "@/lib/utils";
import { Clock, Package, CreditCard, Store, User } from "lucide-react";

interface KitchenOrderCardProps {
  order: Order;
  onClick: () => void;
  index?: number;
}

export function KitchenOrderCard({ order, onClick, index = 0 }: KitchenOrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const minutesAgo = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
  const isBalcao = order.orderType === "balcao";

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 100}ms` }}
      className={cn(
        "relative w-full p-6 rounded-2xl transition-all duration-300 active:scale-95",
        "shadow-lg hover:shadow-xl animate-slide-in-up",
        isBalcao
          ? "bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400"
          : "bg-card border-2 border-acai-yellow"
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "absolute top-4 right-4 w-4 h-4 rounded-full animate-pulse",
          isBalcao ? "bg-orange-500" : "bg-acai-yellow"
        )}
      />

      {/* Order type badge */}
      <div className={cn(
        "absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1",
        isBalcao 
          ? "bg-orange-500 text-white" 
          : "bg-acai-purple text-white"
      )}>
        {isBalcao ? (
          <>
            <Store className="w-3 h-3" />
            BALCÃO
          </>
        ) : (
          <>
            <CreditCard className="w-3 h-3" />
            MESA
          </>
        )}
      </div>

      {/* Order number */}
      <div className="text-center mb-4 mt-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
          {isBalcao ? (
            <Store className="w-4 h-4" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isBalcao ? "Balcão" : "Comanda"}
          </span>
        </div>
        <span className={cn(
          "text-5xl font-bold",
          isBalcao ? "text-orange-600" : "text-acai-purple-deep"
        )}>
          #{order.comandaNumber.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Customer name for balcao orders */}
      {isBalcao && order.customerName && (
        <div className="flex items-center justify-center gap-2 mb-3 text-orange-700">
          <User className="w-4 h-4" />
          <span className="font-medium">{order.customerName}</span>
        </div>
      )}

      {/* Status badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4",
          order.status === "preparing"
            ? isBalcao 
              ? "bg-orange-200 text-orange-800"
              : "bg-acai-yellow/20 text-acai-yellow-dark"
            : "bg-green-100 text-green-700"
        )}
      >
        {order.status === "preparing" ? (
          <>
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isBalcao ? "bg-orange-500" : "bg-acai-yellow"
            )} />
            Em preparo
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {isBalcao ? "Pronto – Balcão" : "Pronto"}
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
