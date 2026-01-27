import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, OrderType } from "@/types/menu";
import { PDVCartItem } from "@/types/admin";

export interface Order {
  id: string;
  comandaNumber: number;
  items: CartItem[];
  status: "preparing" | "ready";
  createdAt: Date;
  readyAt?: Date;
  orderType: OrderType; // "comanda" = mesa/QRCode, "balcao" = PDV counter
  customerName?: string; // Optional customer name for counter orders
  origin: "cardapio" | "pdv"; // Where the order came from
}

// Kitchen order item from PDV
export interface KitchenOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  observation?: string;
}

interface OrdersContextType {
  orders: Order[];
  readyOrders: Order[];
  addOrder: (items: CartItem[], comandaNumber: number) => void;
  addBalcaoOrder: (items: PDVCartItem[], customerName?: string) => number; // Returns the balcao order number
  markAsReady: (orderId: string) => void;
  removeReadyOrder: (orderId: string) => void;
  nextBalcaoNumber: number;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    // Pedidos de exemplo para demonstração
    {
      id: "demo-1",
      comandaNumber: 5,
      items: [
        { product: { id: "1", name: "Açaí 300ml", description: "Açaí puro", price: 12, category: "acai", productType: "whole", needsPreparation: true }, quantity: 2, observation: "Sem granola" },
        { product: { id: "2", name: "Açaí 500ml", description: "Açaí puro", price: 18, category: "acai", productType: "whole", needsPreparation: true }, quantity: 1, observation: "" },
      ],
      status: "preparing",
      createdAt: new Date(Date.now() - 5 * 60000),
      orderType: "comanda",
      origin: "cardapio",
    },
    {
      id: "demo-2",
      comandaNumber: 12,
      items: [
        { product: { id: "3", name: "Pastel de Carne", description: "Pastel grande", price: 8, category: "pasteis", productType: "whole", needsPreparation: true }, quantity: 3, observation: "Bem passado" },
      ],
      status: "preparing",
      createdAt: new Date(Date.now() - 3 * 60000),
      orderType: "comanda",
      origin: "cardapio",
    },
  ]);
  
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [nextBalcaoNumber, setNextBalcaoNumber] = useState(1);

  const addOrder = useCallback((items: CartItem[], comandaNumber: number) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      comandaNumber,
      items,
      status: "preparing",
      createdAt: new Date(),
      orderType: "comanda",
      origin: "cardapio",
    };
    
    setOrders((prev) => [...prev, newOrder]);
  }, []);

  const addBalcaoOrder = useCallback((items: PDVCartItem[], customerName?: string) => {
    const currentNumber = nextBalcaoNumber;
    
    // Convert PDVCartItem to CartItem for kitchen display
    const cartItems: CartItem[] = items
      .filter(item => item.needsPreparation)
      .map(item => ({
        product: {
          id: item.productId,
          name: item.productName,
          description: "",
          price: item.unitPrice,
          category: "",
          productType: "whole" as const,
          needsPreparation: true,
        },
        quantity: item.quantity,
        observation: item.observation || "",
      }));

    if (cartItems.length > 0) {
      const newOrder: Order = {
        id: `balcao-${Date.now()}`,
        comandaNumber: currentNumber,
        items: cartItems,
        status: "preparing",
        createdAt: new Date(),
        orderType: "balcao",
        customerName,
        origin: "pdv",
      };
      
      setOrders((prev) => [...prev, newOrder]);
      setNextBalcaoNumber((prev) => prev + 1);
    }
    
    return currentNumber;
  }, [nextBalcaoNumber]);

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
        addBalcaoOrder,
        markAsReady,
        removeReadyOrder,
        nextBalcaoNumber,
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
