import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem } from "@/types/menu";

export interface Order {
  id: string;
  comandaNumber: number;
  items: CartItem[];
  status: "preparing" | "ready";
  createdAt: Date;
  readyAt?: Date;
}

interface OrdersContextType {
  orders: Order[];
  readyOrders: Order[];
  addOrder: (items: CartItem[], comandaNumber: number) => void;
  markAsReady: (orderId: string) => void;
  removeReadyOrder: (orderId: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    // Pedidos de exemplo para demonstração
    {
      id: "demo-1",
      comandaNumber: 5,
      items: [
        { product: { id: "1", name: "Açaí 300ml", description: "Açaí puro", price: 12, category: "acai" }, quantity: 2, observation: "Sem granola" },
        { product: { id: "2", name: "Açaí 500ml", description: "Açaí puro", price: 18, category: "acai" }, quantity: 1, observation: "" },
      ],
      status: "preparing",
      createdAt: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "demo-2",
      comandaNumber: 12,
      items: [
        { product: { id: "3", name: "Pastel de Carne", description: "Pastel grande", price: 8, category: "pasteis" }, quantity: 3, observation: "Bem passado" },
      ],
      status: "preparing",
      createdAt: new Date(Date.now() - 3 * 60000),
    },
    {
      id: "demo-3",
      comandaNumber: 8,
      items: [
        { product: { id: "4", name: "Suco de Laranja", description: "Natural", price: 7, category: "bebidas" }, quantity: 2, observation: "Sem gelo" },
        { product: { id: "5", name: "Água Mineral", description: "500ml", price: 4, category: "bebidas" }, quantity: 1, observation: "" },
      ],
      status: "preparing",
      createdAt: new Date(Date.now() - 1 * 60000),
    },
  ]);
  
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);

  const addOrder = useCallback((items: CartItem[], comandaNumber: number) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      comandaNumber,
      items,
      status: "preparing",
      createdAt: new Date(),
    };
    
    setOrders((prev) => [...prev, newOrder]);
  }, []);

  const markAsReady = useCallback((orderId: string) => {
    setOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (order) {
        const readyOrder: Order = {
          ...order,
          status: "ready",
          readyAt: new Date(),
        };
        setReadyOrders((prevReady) => [...prevReady, readyOrder]);
      }
      return prev.filter((o) => o.id !== orderId);
    });
  }, []);

  const removeReadyOrder = useCallback((orderId: string) => {
    setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        readyOrders,
        addOrder,
        markAsReady,
        removeReadyOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
