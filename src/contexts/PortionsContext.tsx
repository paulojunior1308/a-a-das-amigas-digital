import React, { createContext, useContext, useState, useCallback } from "react";
import { Portion, PortionIngredient } from "@/types/admin";

interface PortionsContextType {
  portions: Portion[];
  addPortion: (portion: Omit<Portion, "id">) => void;
  updatePortion: (id: string, portion: Partial<Portion>) => void;
  deletePortion: (id: string) => void;
  getPortionById: (id: string) => Portion | undefined;
  getActivePortions: () => Portion[];
}

const PortionsContext = createContext<PortionsContextType | undefined>(undefined);

// Mock data for portions
const initialPortions: Portion[] = [
  {
    id: "portion-batata-p",
    name: "Batata P c/ Cheddar",
    description: "Porção pequena de batata com cheddar",
    price: 14.00,
    category: "batata",
    active: true,
    ingredients: [
      { productId: "batata-congelada", productName: "Batata Congelada", consumeAmount: 200, unit: "g" },
      { productId: "cheddar-liquido", productName: "Cheddar Líquido", consumeAmount: 40, unit: "ml" },
    ],
  },
  {
    id: "portion-batata-m",
    name: "Batata M c/ Cheddar e Bacon",
    description: "Porção média de batata com cheddar e bacon",
    price: 20.00,
    category: "batata",
    active: true,
    ingredients: [
      { productId: "batata-congelada", productName: "Batata Congelada", consumeAmount: 350, unit: "g" },
      { productId: "cheddar-liquido", productName: "Cheddar Líquido", consumeAmount: 60, unit: "ml" },
      { productId: "bacon-picado", productName: "Bacon Picado", consumeAmount: 30, unit: "g" },
    ],
  },
  {
    id: "portion-batata-g",
    name: "Batata G c/ Cheddar e Bacon",
    description: "Porção grande de batata com cheddar e bacon",
    price: 28.00,
    category: "batata",
    active: true,
    ingredients: [
      { productId: "batata-congelada", productName: "Batata Congelada", consumeAmount: 500, unit: "g" },
      { productId: "cheddar-liquido", productName: "Cheddar Líquido", consumeAmount: 100, unit: "ml" },
      { productId: "bacon-picado", productName: "Bacon Picado", consumeAmount: 50, unit: "g" },
    ],
  },
];

export function PortionsProvider({ children }: { children: React.ReactNode }) {
  const [portions, setPortions] = useState<Portion[]>(initialPortions);

  const addPortion = useCallback((portion: Omit<Portion, "id">) => {
    const newPortion: Portion = {
      ...portion,
      id: `portion-${Date.now()}`,
    };
    setPortions((prev) => [...prev, newPortion]);
  }, []);

  const updatePortion = useCallback((id: string, portionData: Partial<Portion>) => {
    setPortions((prev) =>
      prev.map((portion) =>
        portion.id === id ? { ...portion, ...portionData } : portion
      )
    );
  }, []);

  const deletePortion = useCallback((id: string) => {
    setPortions((prev) => prev.filter((portion) => portion.id !== id));
  }, []);

  const getPortionById = useCallback(
    (id: string) => portions.find((p) => p.id === id),
    [portions]
  );

  const getActivePortions = useCallback(
    () => portions.filter((p) => p.active),
    [portions]
  );

  return (
    <PortionsContext.Provider
      value={{
        portions,
        addPortion,
        updatePortion,
        deletePortion,
        getPortionById,
        getActivePortions,
      }}
    >
      {children}
    </PortionsContext.Provider>
  );
}

export function usePortions() {
  const context = useContext(PortionsContext);
  if (context === undefined) {
    throw new Error("usePortions must be used within a PortionsProvider");
  }
  return context;
}
