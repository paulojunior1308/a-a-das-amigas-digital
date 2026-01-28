export type ProductType = "whole" | "fractional";
export type MeasureUnit = "g" | "ml";
export type OrderType = "comanda" | "balcao";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  costPrice?: number;
  image?: string;
  active?: boolean;
  needsPreparation?: boolean; // Flag to indicate if product needs kitchen preparation
  // Product type fields
  productType: ProductType;
  // Fractional product fields
  measureUnit?: MeasureUnit;
  unitVolume?: number; // Volume per whole unit (e.g., 2000g per bag)
  stockUnits?: number; // Number of whole units in stock
}

export interface CartItem {
  product: Product;
  quantity: number;
  observation: string;
  // Composite product fields
  isComposite?: boolean;
  compositeId?: string;
  selectedIngredients?: {
    productId: string;
    productName: string;
    quantity: number;
    measureUnit: "g" | "ml" | "un";
    included: boolean;
  }[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}
