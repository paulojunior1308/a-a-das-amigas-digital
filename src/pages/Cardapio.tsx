import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useComanda } from "@/contexts/ComandaContext";
import { useCompositeProducts } from "@/contexts/CompositeProductsContext";
import { useStockDeduction } from "@/hooks/useStockDeduction";
import { CardapioHeader } from "@/components/menu/CardapioHeader";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { CategorySection } from "@/components/menu/CategorySection";
import { CompositeProductSection } from "@/components/menu/CompositeProductSection";
import { AddItemModal } from "@/components/menu/AddItemModal";
import { AddCompositeItemModal } from "@/components/menu/AddCompositeItemModal";
import { CartBar } from "@/components/menu/CartBar";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { OrderSent } from "@/components/menu/OrderSent";
import { SearchBar } from "@/components/menu/SearchBar";
import { BackToTopButton } from "@/components/menu/BackToTopButton";
import { categories as baseCategories, products } from "@/data/menuData";
import { Product, Category } from "@/types/menu";
import { CompositeProduct } from "@/types/compositeProduct";

// Add composite product categories to navigation
const compositeCategories: Category[] = [
  { id: "lanches", name: "Lanches" },
  { id: "porcoes", name: "Porções" },
  { id: "doses", name: "Doses" },
];

// Merge categories: composite first, then regular (excluding old duplicates)
const categories: Category[] = [
  ...compositeCategories,
  ...baseCategories.filter((cat) => !["lanches", "porcoes"].includes(cat.id)),
];
import { AlertCircle } from "lucide-react";

function CardapioContent() {
  const [searchParams] = useSearchParams();
  const { comandaNumber, setComandaNumber, isComandaValid } = useComanda();
  const { getActiveByType } = useCompositeProducts();
  const { deductStockForOrder } = useStockDeduction();
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCompositeProduct, setSelectedCompositeProduct] = useState<CompositeProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderSent, setShowOrderSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { clearCart, items } = useCart();
  const { addOrder } = useOrders();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get composite products by type
  const activeLanches = getActiveByType("lanche");
  const activePorcoes = getActiveByType("porcao");
  const activeDoses = getActiveByType("dose");

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

  // Filtrar produtos por busca (regular products)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Filter composite products by search
  const filteredLanches = useMemo(() => {
    if (!searchQuery.trim()) return activeLanches;
    const query = searchQuery.toLowerCase();
    return activeLanches.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchQuery, activeLanches]);

  const filteredPorcoes = useMemo(() => {
    if (!searchQuery.trim()) return activePorcoes;
    const query = searchQuery.toLowerCase();
    return activePorcoes.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchQuery, activePorcoes]);

  const filteredDoses = useMemo(() => {
    if (!searchQuery.trim()) return activeDoses;
    const query = searchQuery.toLowerCase();
    return activeDoses.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchQuery, activeDoses]);

  // Regular products by category (excluding categories that have composite products)
  const productsByCategory = useMemo(() => {
    return categories
      .filter((cat) => !["lanches", "porcoes"].includes(cat.id)) // These are now composite
      .map((category) => ({
        category,
        products: filteredProducts.filter((p) => p.category === category.id),
      }));
  }, [filteredProducts]);

  // Controlar visibilidade do botão "voltar ao topo"
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowBackToTop(container.scrollTop > 300);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Intersection Observer para detectar categoria visível (including composite categories)
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    // Pequeno delay para garantir que os elementos estejam renderizados
    const timeoutId = setTimeout(() => {
      const observers: IntersectionObserver[] = [];

      // Usar rootMargin que captura elementos próximos ao topo da área visível
      const observerOptions: IntersectionObserverInit = {
        root,
        rootMargin: "-120px 0px -70% 0px", // Ajustado para considerar header + nav fixos
        threshold: 0,
      };

      // Observe all categories in order
      categories.forEach((category) => {
        const element = document.getElementById(`category-${category.id}`);
        if (!element) return;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveCategory(category.id);
            }
          });
        }, observerOptions);

        observer.observe(element);
        observers.push(observer);
      });

      return () => {
        observers.forEach((observer) => observer.disconnect());
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeLanches, activePorcoes, activeDoses]); // Re-run when products load

  const handleCategoryChange = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (!element) return;

    // Navegação puramente por rolagem até a âncora (dentro do container de scroll)
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCheckout = () => {
    if (!comandaNumber) return;

    // Deduct stock for all items (smart deduction for composites)
    deductStockForOrder(items);

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
          <h1 className="text-2xl font-bold text-white mb-3">Comanda Inválida</h1>
          <p className="text-acai-lilac text-lg">
            Por favor, escaneie o QR Code da sua mesa para acessar o cardápio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-acai-purple-deep">
      <CardapioHeader comandaNumber={comandaNumber} />

      <div className="px-4">
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Campo de busca */}
      <div className="px-4 py-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Container único de scroll do cardápio */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-28"
      >
        {/* Composite Products: Lanches */}
        <CompositeProductSection
          title="Lanches"
          categoryId="lanches"
          products={filteredLanches}
          onAddProduct={setSelectedCompositeProduct}
        />

        {/* Composite Products: Porções */}
        <CompositeProductSection
          title="Porções"
          categoryId="porcoes"
          products={filteredPorcoes}
          onAddProduct={setSelectedCompositeProduct}
        />

        {/* Composite Products: Doses/Bebidas */}
        {filteredDoses.length > 0 && (
          <CompositeProductSection
            title="Doses"
            categoryId="doses"
            products={filteredDoses}
            onAddProduct={setSelectedCompositeProduct}
          />
        )}

        {/* Regular products by category */}
        {productsByCategory.map(({ category, products }) => (
          <CategorySection
            key={category.id}
            category={category}
            products={products}
            onAddProduct={setSelectedProduct}
          />
        ))}
      </main>

      {/* Botão voltar ao topo */}
      <BackToTopButton visible={showBackToTop} onClick={scrollToTop} />

      <CartBar onOpenCart={() => setIsCartOpen(true)} />

      {/* Modal for regular products */}
      {selectedProduct && (
        <AddItemModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Modal for composite products */}
      {selectedCompositeProduct && (
        <AddCompositeItemModal
          product={selectedCompositeProduct}
          isOpen={!!selectedCompositeProduct}
          onClose={() => setSelectedCompositeProduct(null)}
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
