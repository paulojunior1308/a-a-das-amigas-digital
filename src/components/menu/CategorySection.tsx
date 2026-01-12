import { Product, Category } from "@/types/menu";
import { ProductCard } from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export function CategorySection({
  category,
  products,
  onAddProduct,
}: CategorySectionProps) {
  if (products.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="mb-8">
      <div className="category-stripe rounded-lg py-3 px-4 mb-4">
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-card-foreground text-shadow-title">
          {category.name}
        </h2>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddClick={onAddProduct}
          />
        ))}
      </div>
    </section>
  );
}
