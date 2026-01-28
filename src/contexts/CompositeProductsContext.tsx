import React, { createContext, useContext, useState, useCallback } from "react";
import { CompositeProduct, CompositeProductType, CompositeIngredient } from "@/types/compositeProduct";

interface CompositeProductsContextType {
  compositeProducts: CompositeProduct[];
  addCompositeProduct: (product: Omit<CompositeProduct, "id">) => void;
  updateCompositeProduct: (id: string, product: Partial<CompositeProduct>) => void;
  deleteCompositeProduct: (id: string) => void;
  getByType: (type: CompositeProductType) => CompositeProduct[];
  getActiveByType: (type: CompositeProductType) => CompositeProduct[];
}

const CompositeProductsContext = createContext<CompositeProductsContextType | undefined>(undefined);

// Initial demo data
const initialCompositeProducts: CompositeProduct[] = [
  // Lanches
  {
    id: "lanche-1",
    name: "X-Burguer",
    description: "Hambúrguer com queijo, alface, tomate e molho especial",
    price: 18.00,
    costPrice: 8.00,
    type: "lanche",
    active: true,
    needsPreparation: true,
    ingredients: [
      { productId: "ing-pao", productName: "Pão de hambúrguer", quantity: 1, measureUnit: "un", requirement: "required", isDefault: true },
      { productId: "ing-carne", productName: "Hambúrguer 150g", quantity: 150, measureUnit: "g", requirement: "required", isDefault: true },
      { productId: "ing-queijo", productName: "Queijo", quantity: 30, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-alface", productName: "Alface", quantity: 20, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-tomate", productName: "Tomate", quantity: 30, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-molho", productName: "Molho especial", quantity: 15, measureUnit: "ml", requirement: "removable", isDefault: true },
    ],
  },
  {
    id: "lanche-2",
    name: "X-Bacon",
    description: "Hambúrguer com bacon crocante, queijo e cebola caramelizada",
    price: 22.00,
    costPrice: 10.00,
    type: "lanche",
    active: true,
    needsPreparation: true,
    ingredients: [
      { productId: "ing-pao", productName: "Pão de hambúrguer", quantity: 1, measureUnit: "un", requirement: "required", isDefault: true },
      { productId: "ing-carne", productName: "Hambúrguer 150g", quantity: 150, measureUnit: "g", requirement: "required", isDefault: true },
      { productId: "ing-bacon", productName: "Bacon", quantity: 40, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-queijo", productName: "Queijo", quantity: 30, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-cebola", productName: "Cebola caramelizada", quantity: 25, measureUnit: "g", requirement: "removable", isDefault: true },
    ],
  },
  // Porções
  {
    id: "porcao-1",
    name: "Batata Frita P",
    description: "Porção pequena de batata frita crocante",
    price: 15.00,
    costPrice: 5.00,
    type: "porcao",
    active: true,
    needsPreparation: true,
    ingredients: [
      { productId: "ing-batata", productName: "Batata", quantity: 200, measureUnit: "g", requirement: "required", isDefault: true },
      { productId: "ing-sal", productName: "Sal", quantity: 5, measureUnit: "g", requirement: "removable", isDefault: true },
    ],
  },
  {
    id: "porcao-2",
    name: "Batata com Cheddar",
    description: "Batata frita com cheddar cremoso e bacon",
    price: 25.00,
    costPrice: 10.00,
    type: "porcao",
    active: true,
    needsPreparation: true,
    ingredients: [
      { productId: "ing-batata", productName: "Batata", quantity: 300, measureUnit: "g", requirement: "required", isDefault: true },
      { productId: "ing-cheddar", productName: "Cheddar", quantity: 80, measureUnit: "ml", requirement: "removable", isDefault: true },
      { productId: "ing-bacon", productName: "Bacon", quantity: 30, measureUnit: "g", requirement: "removable", isDefault: true },
    ],
  },
  // Doses
  {
    id: "dose-1",
    name: "Caipirinha",
    description: "Caipirinha tradicional de limão",
    price: 16.00,
    costPrice: 6.00,
    type: "dose",
    active: true,
    needsPreparation: true,
    ingredients: [
      { productId: "ing-cachaca", productName: "Cachaça", quantity: 50, measureUnit: "ml", requirement: "required", isDefault: true },
      { productId: "ing-limao", productName: "Limão", quantity: 1, measureUnit: "un", requirement: "required", isDefault: true },
      { productId: "ing-acucar", productName: "Açúcar", quantity: 20, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-gelo", productName: "Gelo", quantity: 100, measureUnit: "g", requirement: "removable", isDefault: true },
    ],
  },
  {
    id: "dose-2",
    name: "Mojito",
    description: "Drink refrescante com rum, hortelã e limão",
    price: 20.00,
    costPrice: 8.00,
    type: "dose",
    active: true,
    needsPreparation: true,
    ingredients: [
      { productId: "ing-rum", productName: "Rum", quantity: 50, measureUnit: "ml", requirement: "required", isDefault: true },
      { productId: "ing-hortela", productName: "Hortelã", quantity: 10, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-limao", productName: "Limão", quantity: 1, measureUnit: "un", requirement: "required", isDefault: true },
      { productId: "ing-acucar", productName: "Açúcar", quantity: 15, measureUnit: "g", requirement: "removable", isDefault: true },
      { productId: "ing-agua-gas", productName: "Água com gás", quantity: 100, measureUnit: "ml", requirement: "removable", isDefault: true },
    ],
  },
];

export function CompositeProductsProvider({ children }: { children: React.ReactNode }) {
  const [compositeProducts, setCompositeProducts] = useState<CompositeProduct[]>(initialCompositeProducts);

  const addCompositeProduct = useCallback((product: Omit<CompositeProduct, "id">) => {
    const newProduct: CompositeProduct = {
      ...product,
      id: `composite-${Date.now()}`,
    };
    setCompositeProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateCompositeProduct = useCallback((id: string, productData: Partial<CompositeProduct>) => {
    setCompositeProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...productData } : product
      )
    );
  }, []);

  const deleteCompositeProduct = useCallback((id: string) => {
    setCompositeProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  const getByType = useCallback(
    (type: CompositeProductType) => compositeProducts.filter((p) => p.type === type),
    [compositeProducts]
  );

  const getActiveByType = useCallback(
    (type: CompositeProductType) => compositeProducts.filter((p) => p.type === type && p.active),
    [compositeProducts]
  );

  return (
    <CompositeProductsContext.Provider
      value={{
        compositeProducts,
        addCompositeProduct,
        updateCompositeProduct,
        deleteCompositeProduct,
        getByType,
        getActiveByType,
      }}
    >
      {children}
    </CompositeProductsContext.Provider>
  );
}

export function useCompositeProducts() {
  const context = useContext(CompositeProductsContext);
  if (context === undefined) {
    throw new Error("useCompositeProducts must be used within a CompositeProductsProvider");
  }
  return context;
}
