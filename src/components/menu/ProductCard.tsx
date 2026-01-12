import { Product } from "@/types/menu";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddClick: (product: Product) => void;
}

export function ProductCard({ product, onAddClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="product-card rounded-xl p-4 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-card-foreground text-base leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm leading-snug line-clamp-2 mb-2">
            {product.description}
          </p>
          <p className="text-primary font-extrabold text-lg">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={() => onAddClick(product)}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label={`Adicionar ${product.name}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
