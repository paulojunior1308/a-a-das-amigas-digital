// Types for Composite Products (Lanches, Porções, Doses)

export type CompositeProductType = "lanche" | "porcao" | "dose";

export type IngredientRequirement = "required" | "optional" | "removable";

export interface CompositeIngredient {
  productId: string; // Reference to stock product
  productName: string;
  quantity: number; // Amount used (in base unit: g, ml, or units)
  measureUnit: "g" | "ml" | "un";
  requirement: IngredientRequirement;
  isDefault: boolean; // If true, starts checked
}

export interface CompositeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  type: CompositeProductType;
  active: boolean;
  needsPreparation: boolean;
  ingredients: CompositeIngredient[];
  image?: string;
}

// For cart/order - tracks which ingredients were included
export interface SelectedIngredient {
  productId: string;
  productName: string;
  quantity: number;
  measureUnit: "g" | "ml" | "un";
  included: boolean; // false = removed by customer, don't deduct stock
}

export interface CompositeCartItem {
  compositeProduct: CompositeProduct;
  quantity: number;
  selectedIngredients: SelectedIngredient[];
  observation: string;
}
