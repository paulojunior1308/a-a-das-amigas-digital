import { useCallback } from "react";
import { useStock } from "@/contexts/StockContext";
import { CartItem } from "@/types/menu";

/**
 * Hook for intelligent stock deduction
 * Only deducts ingredients that are actually included (not removed by customer)
 */
export function useStockDeduction() {
  const { decreaseStock, decreaseFractionalStock } = useStock();

  /**
   * Deduct stock for a cart item
   * For composite products, only deducts included ingredients
   */
  const deductStockForItem = useCallback(
    (item: CartItem) => {
      // If it's a composite product with ingredient selections
      if (item.isComposite && item.selectedIngredients) {
        item.selectedIngredients.forEach((ingredient) => {
          // Only deduct if ingredient is included
          if (ingredient.included) {
            const amount = ingredient.quantity * item.quantity;
            
            // Use fractional or whole stock deduction based on unit
            if (ingredient.measureUnit === "un") {
              decreaseStock(ingredient.productId, amount);
            } else {
              // Fractional products (g, ml)
              decreaseFractionalStock(ingredient.productId, amount);
            }
          }
        });
      } else {
        // Regular product - simple stock deduction
        decreaseStock(item.product.id, item.quantity);
      }
    },
    [decreaseStock, decreaseFractionalStock]
  );

  /**
   * Deduct stock for multiple cart items
   */
  const deductStockForOrder = useCallback(
    (items: CartItem[]) => {
      items.forEach((item) => {
        deductStockForItem(item);
      });
    },
    [deductStockForItem]
  );

  return {
    deductStockForItem,
    deductStockForOrder,
  };
}
