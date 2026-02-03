import { CompositeProduct } from "@/types/compositeProduct";

interface CompositeProductCardProps {
  product: CompositeProduct;
  onAddClick: (product: CompositeProduct) => void;
}

function CompositeProductCard({ product, onAddClick }: CompositeProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Get removable ingredient names for preview
  const removableIngredients = product.ingredients
    .filter((i) => i.requirement === "removable")
    .map((i) => i.productName)
    .slice(0, 3);

  return (
    <div className="product-card rounded-xl p-4 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-card-foreground text-base leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm leading-snug line-clamp-2 mb-1">
            {product.description}
          </p>
          {removableIngredients.length > 0 && (
            <p className="text-xs text-accent">
              ✏️ Personalizável: {removableIngredients.join(", ")}
              {product.ingredients.filter((i) => i.requirement === "removable").length > 3 && "..."}
            </p>
          )}
          <p className="text-primary font-extrabold text-lg mt-2">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={() => onAddClick(product)}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label={`Adicionar ${product.name}`}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

interface CompositeProductSectionProps {
  title: string;
  categoryId: string;
  products: CompositeProduct[];
  onAddProduct: (product: CompositeProduct) => void;
}

export function CompositeProductSection({
  title,
  categoryId,
  products,
  onAddProduct,
}: CompositeProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section id={`category-${categoryId}`} className="mb-8">
      <div className="category-stripe rounded-lg py-3 px-4 mb-4">
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-card-foreground text-shadow-title">
          {title}
        </h2>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <CompositeProductCard
            key={product.id}
            product={product}
            onAddClick={onAddProduct}
          />
        ))}
      </div>
    </section>
  );
}
