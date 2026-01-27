import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, Category } from "@/types/menu";
import { products as initialProducts, categories as initialCategories } from "@/data/menuData";

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getProductsByCategory: (categoryId: string) => Product[];
  getWholeProducts: () => Product[];
  getFractionalProducts: () => Product[];
  getActiveProducts: () => Product[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...productData } : product
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: `category-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, categoryData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, ...categoryData } : category
      )
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id));
    // Also remove products from this category
    setProducts((prev) => prev.filter((product) => product.category !== id));
  }, []);

  const getProductsByCategory = useCallback(
    (categoryId: string) => {
      return products.filter((product) => product.category === categoryId);
    },
    [products]
  );

  const getWholeProducts = useCallback(
    () => products.filter((p) => p.productType === "whole"),
    [products]
  );

  const getFractionalProducts = useCallback(
    () => products.filter((p) => p.productType === "fractional"),
    [products]
  );

  const getActiveProducts = useCallback(
    () => products.filter((p) => p.active !== false),
    [products]
  );

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        getProductsByCategory,
        getWholeProducts,
        getFractionalProducts,
        getActiveProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
