import React, { createContext, useContext, useState, useCallback } from "react";
import { StockItem } from "@/types/admin";
import { products } from "@/data/menuData";

interface StockContextType {
  stock: StockItem[];
  getStockForProduct: (productId: string) => number;
  updateStock: (productId: string, quantity: number) => void;
  decreaseStock: (productId: string, amount: number) => void;
  setMinQuantity: (productId: string, minQty: number) => void;
  getLowStockItems: () => StockItem[];
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: React.ReactNode }) {
  // Initialize stock with mock data - all products have 50 units
  const [stock, setStock] = useState<StockItem[]>(() =>
    products.map((p) => ({
      productId: p.id,
      quantity: Math.floor(Math.random() * 80) + 20, // 20-100 units
      minQuantity: 10,
    }))
  );

  const getStockForProduct = useCallback(
    (productId: string) => {
      const item = stock.find((s) => s.productId === productId);
      return item?.quantity ?? 0;
    },
    [stock]
  );

  const updateStock = useCallback((productId: string, quantity: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const decreaseStock = useCallback((productId: string, amount: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, item.quantity - amount) }
          : item
      )
    );
  }, []);

  const setMinQuantity = useCallback((productId: string, minQty: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, minQuantity: minQty } : item
      )
    );
  }, []);

  const getLowStockItems = useCallback(() => {
    return stock.filter((item) => item.quantity <= item.minQuantity);
  }, [stock]);

  return (
    <StockContext.Provider
      value={{
        stock,
        getStockForProduct,
        updateStock,
        decreaseStock,
        setMinQuantity,
        getLowStockItems,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
}
