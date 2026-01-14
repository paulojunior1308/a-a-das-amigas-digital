import { useState, useMemo, useEffect, useRef } from "react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { Header } from "@/components/menu/Header";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { CategorySection } from "@/components/menu/CategorySection";
import { AddItemModal } from "@/components/menu/AddItemModal";
import { CartBar } from "@/components/menu/CartBar";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { categories, products } from "@/data/menuData";
import { Product } from "@/types/menu";
import { Navigate } from "react-router-dom";

function MenuContent() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { clearCart, totalItems, items } = useCart();

  // Redirecionar para a nova estrutura
  // A página Index agora é apenas de login
  return <Navigate to="/" replace />;
}

const Index = () => {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
};

export default Index;
