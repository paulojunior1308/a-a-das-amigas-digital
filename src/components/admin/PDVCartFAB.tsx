import { ShoppingCart } from "lucide-react";

interface PDVCartFABProps {
  itemCount: number;
  total: number;
  onClick: () => void;
}

export function PDVCartFAB({ itemCount, total, onClick }: PDVCartFABProps) {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 lg:hidden bg-acai-green hover:bg-acai-green/90 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
          {itemCount}
        </span>
      </div>
      <div className="text-left">
        <p className="text-xs opacity-80">{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
        <p className="font-bold">R$ {total.toFixed(2)}</p>
      </div>
    </button>
  );
}
