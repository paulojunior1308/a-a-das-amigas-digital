import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product, CartItem } from "@/types/menu";

interface SelectedIngredient {
  productId: string;
  productName: string;
  quantity: number;
  measureUnit: "g" | "ml" | "un";
  included: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product, 
    quantity: number, 
    observation: string,
    isComposite?: boolean,
    compositeId?: string,
    selectedIngredients?: SelectedIngredient[]
  ) => void;
  removeItem: (itemIndex: number) => void;
  updateQuantity: (itemIndex: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (
    product: Product, 
    quantity: number, 
    observation: string,
    isComposite?: boolean,
    compositeId?: string,
    selectedIngredients?: SelectedIngredient[]
  ) => {
    setItems((prev) => {
      // For composite products, always add as new item (customization may differ)
      if (isComposite) {
        return [...prev, { 
          product, 
          quantity, 
          observation, 
          isComposite, 
          compositeId, 
          selectedIngredients 
        }];
      }

      // For regular products, check if same product with same observation exists
      const existingIndex = prev.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.observation === observation &&
          !item.isComposite
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, observation }];
    });
  };

  const removeItem = (itemIndex: number) => {
    setItems((prev) => prev.filter((_, index) => index !== itemIndex));
  };

  const updateQuantity = (itemIndex: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemIndex);
      return;
    }

    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
