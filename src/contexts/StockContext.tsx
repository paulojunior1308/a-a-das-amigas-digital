import React, { createContext, useContext, useState, useCallback } from "react";
import { StockItem } from "@/types/admin";
import { products } from "@/data/menuData";

interface StockContextType {
  stock: StockItem[];
  getStockForProduct: (productId: string) => number;
  updateStock: (productId: string, quantity: number) => void;
  decreaseStock: (productId: string, amount: number) => void;
  decreaseFractionalStock: (productId: string, volumeAmount: number) => boolean;
  setMinQuantity: (productId: string, minQty: number) => void;
  getLowStockItems: () => StockItem[];
  checkFractionalStockAvailable: (productId: string, volumeNeeded: number) => boolean;
  getTotalVolume: (productId: string) => number;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: React.ReactNode }) {
  // Initialize stock with proper values based on product type
  const [stock, setStock] = useState<StockItem[]>(() =>
    products.map((p) => {
      if (p.productType === "fractional" && p.unitVolume && p.stockUnits !== undefined) {
        // For fractional products, store total volume available
        return {
          productId: p.id,
          quantity: p.stockUnits * p.unitVolume, // Total volume
          minQuantity: p.unitVolume * 0.5, // Min = half a unit
        };
      }
      // For whole products, store units
      return {
        productId: p.id,
        quantity: Math.floor(Math.random() * 80) + 20, // 20-100 units
        minQuantity: 10,
      };
    })
  );

  const getStockForProduct = useCallback(
    (productId: string) => {
      const item = stock.find((s) => s.productId === productId);
      return item?.quantity ?? 0;
    },
    [stock]
  );

  const getTotalVolume = useCallback(
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

  const checkFractionalStockAvailable = useCallback(
    (productId: string, volumeNeeded: number) => {
      const currentStock = getStockForProduct(productId);
      return currentStock >= volumeNeeded;
    },
    [getStockForProduct]
  );

  const decreaseFractionalStock = useCallback(
    (productId: string, volumeAmount: number) => {
      const currentStock = getStockForProduct(productId);
      if (currentStock < volumeAmount) {
        return false;
      }
      setStock((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity - volumeAmount) }
            : item
        )
      );
      return true;
    },
    [getStockForProduct]
  );

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
        decreaseFractionalStock,
        setMinQuantity,
        getLowStockItems,
        checkFractionalStockAvailable,
        getTotalVolume,
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
