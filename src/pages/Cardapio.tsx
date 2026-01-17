import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useComanda } from "@/contexts/ComandaContext";
import { CardapioHeader } from "@/components/menu/CardapioHeader";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { CategorySection } from "@/components/menu/CategorySection";
import { AddItemModal } from "@/components/menu/AddItemModal";
import { CartBar } from "@/components/menu/CartBar";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { OrderSent } from "@/components/menu/OrderSent";
import { categories, products } from "@/data/menuData";
import { Product } from "@/types/menu";
import { AlertCircle } from "lucide-react";

function CardapioContent() {
  const [searchParams] = useSearchParams();
  const { comandaNumber, setComandaNumber, isComandaValid } = useComanda();
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderSent, setShowOrderSent] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { clearCart, totalItems, items } = useCart();
  const { addOrder } = useOrders();

  // Capturar número da comanda da URL ao carregar
  useEffect(() => {
    const comandaParam = searchParams.get("comanda");
    if (comandaParam) {
      const numero = parseInt(comandaParam, 10);
      if (!isNaN(numero) && numero > 0) {
        setComandaNumber(numero);
      }
    }
  }, [searchParams, setComandaNumber]);

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
      // Offset para header (88px) + menu categorias (~56px) + margem
      const headerOffset = 160;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  const handleCheckout = () => {
    if (!comandaNumber) return;
    
    // Enviar pedido para a cozinha com número da comanda
    addOrder(items, comandaNumber);
    clearCart();
    setIsCartOpen(false);
    setShowOrderSent(true);
    
    // Fechar mensagem após 3 segundos
    setTimeout(() => setShowOrderSent(false), 3000);
  };

  // Se não tem comanda válida, mostrar erro
  if (!isComandaValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Comanda Inválida
          </h1>
          <p className="text-acai-lilac text-lg">
            Por favor, escaneie o QR Code da sua mesa para acessar o cardápio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <CardapioHeader comandaNumber={comandaNumber} />

      <div className="px-4">
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <main className="px-4 pt-4">
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

      {showOrderSent && <OrderSent comandaNumber={comandaNumber} />}
    </div>
  );
}

export default function Cardapio() {
  return (
    <CartProvider>
      <CardapioContent />
    </CartProvider>
  );
}
