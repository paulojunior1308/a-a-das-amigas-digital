import React, { createContext, useContext, useState, useCallback } from "react";
import { Sale, SaleItem } from "@/types/admin";

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, "id" | "createdAt">) => void;
  getSalesByPeriod: (startDate: Date, endDate: Date) => Sale[];
  getSalesByType: (type: "pdv" | "comanda") => Sale[];
  getTotalSales: () => number;
  getTodaySales: () => Sale[];
  getProductSalesCount: () => { productId: string; productName: string; count: number }[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  // Initialize with mock sales data
  const [sales, setSales] = useState<Sale[]>(() => {
    const mockSales: Sale[] = [];
    const today = new Date();
    
    // Generate sales for the last 7 days
    for (let i = 0; i < 25; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 12) + 10); // 10am - 10pm
      
      mockSales.push({
        id: `sale-${i}`,
        items: [
          {
            productId: "acai-300",
            productName: "Açaí no Copo 300ml",
            quantity: Math.floor(Math.random() * 3) + 1,
            unitPrice: 12.0,
            total: 12.0 * (Math.floor(Math.random() * 3) + 1),
          },
        ],
        total: 12.0 * (Math.floor(Math.random() * 3) + 1) + Math.random() * 30,
        type: Math.random() > 0.5 ? "pdv" : "comanda",
        comandaNumber: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 1 : undefined,
        paymentMethod: ["dinheiro", "pix", "cartao_debito", "cartao_credito"][
          Math.floor(Math.random() * 4)
        ] as Sale["paymentMethod"],
        createdAt: date,
      });
    }
    
    return mockSales;
  });

  const addSale = useCallback((sale: Omit<Sale, "id" | "createdAt">) => {
    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
      createdAt: new Date(),
    };
    setSales((prev) => [...prev, newSale]);
  }, []);

  const getSalesByPeriod = useCallback(
    (startDate: Date, endDate: Date) => {
      return sales.filter(
        (sale) => sale.createdAt >= startDate && sale.createdAt <= endDate
      );
    },
    [sales]
  );

  const getSalesByType = useCallback(
    (type: "pdv" | "comanda") => {
      return sales.filter((sale) => sale.type === type);
    },
    [sales]
  );

  const getTotalSales = useCallback(() => {
    return sales.reduce((acc, sale) => acc + sale.total, 0);
  }, [sales]);

  const getTodaySales = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return sales.filter(
      (sale) => sale.createdAt >= today && sale.createdAt < tomorrow
    );
  }, [sales]);

  const getProductSalesCount = useCallback(() => {
    const counts: Record<string, { productName: string; count: number }> = {};
    
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!counts[item.productId]) {
          counts[item.productId] = { productName: item.productName, count: 0 };
        }
        counts[item.productId].count += item.quantity;
      });
    });

    return Object.entries(counts)
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [sales]);

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        getSalesByPeriod,
        getSalesByType,
        getTotalSales,
        getTodaySales,
        getProductSalesCount,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}
