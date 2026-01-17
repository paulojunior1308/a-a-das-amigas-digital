import { Product, Category } from "@/types/menu";
import { ProductCard } from "./ProductCard";
import { useEffect, useRef, useState } from "react";

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onAddProduct: (product: Product) => void;
}

function AnimatedProductCard({ 
  product, 
  onAddClick, 
  delay 
}: { 
  product: Product; 
  onAddClick: (product: Product) => void; 
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <ProductCard product={product} onAddClick={onAddClick} />
    </div>
  );
}

export function CategorySection({
  category,
  products,
  onAddProduct,
}: CategorySectionProps) {
  if (products.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="mb-8 scroll-mt-40">
      <div className="category-stripe rounded-lg py-3 px-4 mb-4">
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-card-foreground text-shadow-title">
          {category.name}
        </h2>
      </div>
      <div className="space-y-3">
        {products.map((product, index) => (
          <AnimatedProductCard
            key={product.id}
            product={product}
            onAddClick={onAddProduct}
            delay={index * 50}
          />
        ))}
      </div>
    </section>
  );
}
