import { useState, useMemo, useEffect, useRef } from "react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { Header } from "@/components/menu/Header";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { CategorySection } from "@/components/menu/CategorySection";
import { AddItemModal } from "@/components/menu/AddItemModal";
import { CartBar } from "@/components/menu/CartBar";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { OrderSuccess } from "@/components/menu/OrderSuccess";
import { categories, products } from "@/data/menuData";
import { Product } from "@/types/menu";

function MenuContent() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const { clearCart, totalItems } = useCart();

  // Intersection Observer para detectar categoria visível
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    const observerOptions = {
      root: null,
      rootMargin: '-200px 0px -50% 0px',
      threshold: 0
    };

    categories.forEach((category) => {
      const element = document.getElementById(`category-${category.id}`);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isScrolling) {
              setActiveCategory(category.id);
            }
          });
        }, observerOptions);
        
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [isScrolling]);

  const productsByCategory = useMemo(() => {
    return categories.map((category) => ({
      category,
      products: products.filter((p) => p.category === category.id),
    }));
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setIsScrolling(true);
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 200;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      
      // Resetar flag após scroll completar
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  const handleCheckout = () => {
    const newOrderNumber = Math.floor(Math.random() * 99) + 1;
    setOrderNumber(newOrderNumber);
    clearCart();
    setIsCartOpen(false);
  };

  const handleNewOrder = () => {
    setOrderNumber(null);
  };

  if (orderNumber !== null) {
    return <OrderSuccess orderNumber={orderNumber} onNewOrder={handleNewOrder} />;
  }

  return (
    <div className="min-h-screen pb-28">
      <Header />

      <main className="px-4">
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {productsByCategory.map(({ category, products }) => (
          <CategorySection
            key={category.id}
            category={category}
            products={products}
            onAddProduct={setSelectedProduct}
          />
        ))}
      </main>

      <CartBar onOpenCart={() => setIsCartOpen(true)} />

      {selectedProduct && (
        <AddItemModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

const Index = () => {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
};

export default Index;
