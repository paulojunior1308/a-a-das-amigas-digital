export interface StockItem {
  productId: string;
  quantity: number; // For whole products: units. For fractional: total volume
  minQuantity: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  type: "pdv" | "comanda";
  comandaNumber?: number;
  paymentMethod: "dinheiro" | "pix" | "cartao_debito" | "cartao_credito";
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PDVCartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  isPortion?: boolean;
  portionId?: string;
  needsPreparation?: boolean;
  observation?: string;
}

// Portion/Dose composition ingredient
export interface PortionIngredient {
  productId: string;
  productName: string;
  consumeAmount: number; // Amount consumed in g or ml
  unit: "g" | "ml";
}

// Portion/Dose product
export interface Portion {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  active: boolean;
  ingredients: PortionIngredient[];
}
