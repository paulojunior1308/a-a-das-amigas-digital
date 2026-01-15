export interface StockItem {
  productId: string;
  quantity: number;
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
}
