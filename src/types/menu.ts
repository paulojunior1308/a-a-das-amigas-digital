export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  observation: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}
