import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

interface CartBarProps {
  onOpenCart: () => void;
}

export function CartBar({ onOpenCart }: CartBarProps) {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-acai-purple-deep via-acai-purple-deep to-transparent pt-8">
      <button
        onClick={onOpenCart}
        className="w-full bg-acai-green hover:bg-acai-green-light text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-bold text-lg">Ver Carrinho</span>
        </div>
        <span className="font-extrabold text-xl">{formatPrice(totalPrice)}</span>
      </button>
    </div>
  );
}
