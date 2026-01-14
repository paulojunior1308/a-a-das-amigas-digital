import { Order } from "@/contexts/OrdersContext";
import { cn } from "@/lib/utils";
import { Bell, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface TVOrderDisplayProps {
  order: Order;
  isNew?: boolean;
}

export function TVOrderDisplay({ order, isNew = false }: TVOrderDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div
      className={cn(
        "relative p-8 rounded-3xl transition-all duration-500",
        "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl",
        isAnimating && "animate-bounce-soft ring-4 ring-acai-yellow ring-offset-4 ring-offset-acai-purple-deep scale-105"
      )}
    >
      {/* New order indicator */}
      {isAnimating && (
        <div className="absolute -top-3 -right-3 bg-acai-yellow text-acai-purple-deep px-4 py-2 rounded-full font-bold text-lg animate-pulse flex items-center gap-2">
          <Bell className="w-5 h-5" />
          NOVO!
        </div>
      )}

      {/* Comanda number */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <CheckCircle className="w-10 h-10" />
          <span className="text-2xl font-semibold uppercase tracking-wider">
            Comanda Pronta
          </span>
        </div>
        <span className="text-8xl font-bold block">
          #{order.comandaNumber.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
