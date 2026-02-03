import { useState, useMemo } from "react";
import { CompositeProduct, SelectedIngredient } from "@/types/compositeProduct";
import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AddCompositeItemModalProps {
  product: CompositeProduct;
  isOpen: boolean;
  onClose: () => void;
}

export function AddCompositeItemModal({ product, isOpen, onClose }: AddCompositeItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const { addItem } = useCart();

  // Initialize ingredient selection based on default values
  const [ingredientSelections, setIngredientSelections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    product.ingredients.forEach((ing) => {
      // Required ingredients are always included, removable/optional start with isDefault
      initial[ing.productId] = ing.requirement === "required" ? true : ing.isDefault;
    });
    return initial;
  });

  // Reset state when product changes
  useMemo(() => {
    const initial: Record<string, boolean> = {};
    product.ingredients.forEach((ing) => {
      initial[ing.productId] = ing.requirement === "required" ? true : ing.isDefault;
    });
    setIngredientSelections(initial);
    setQuantity(1);
    setObservation("");
  }, [product.id]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleIngredientToggle = (productId: string, requirement: string) => {
    // Can't toggle required ingredients
    if (requirement === "required") return;
    
    setIngredientSelections((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAdd = () => {
    // Build selected ingredients array
    const selectedIngredients: SelectedIngredient[] = product.ingredients.map((ing) => ({
      productId: ing.productId,
      productName: ing.productName,
      quantity: ing.quantity,
      measureUnit: ing.measureUnit,
      included: ingredientSelections[ing.productId] ?? ing.isDefault,
    }));

    // Create a virtual Product for cart compatibility
    const virtualProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.type,
      productType: "whole" as const,
      needsPreparation: product.needsPreparation,
      active: product.active,
    };

    addItem(virtualProduct, quantity, observation, true, product.id, selectedIngredients);
    
    // Reset and close
    setQuantity(1);
    setObservation("");
    onClose();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const total = product.price * quantity;

  // Separate ingredients by type for display
  const requiredIngredients = product.ingredients.filter((i) => i.requirement === "required");
  const removableIngredients = product.ingredients.filter((i) => i.requirement === "removable");
  const optionalIngredients = product.ingredients.filter((i) => i.requirement === "optional");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-acai-lilac-light rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card flex items-center justify-center text-card-foreground transition-colors hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-10 mb-4">
          <h3 className="text-xl font-bold text-card-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm">
            {product.description}
          </p>
        </div>

        {/* Ingredients Section */}
        <div className="mb-4 space-y-4">
          {/* Required ingredients (shown but not toggleable) */}
          {requiredIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Ingredientes fixos
              </p>
              <div className="space-y-1">
                {requiredIngredients.map((ing) => (
                  <div key={ing.productId} className="flex items-center gap-2 text-sm text-card-foreground opacity-70">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">✓</span>
                    <span>{ing.productName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removable ingredients */}
          {removableIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Personalize seu pedido
              </p>
              <div className="bg-card rounded-xl p-3 space-y-2">
                {removableIngredients.map((ing) => (
                  <div key={ing.productId} className="flex items-center gap-3">
                    <Checkbox
                      id={`ing-${ing.productId}`}
                      checked={ingredientSelections[ing.productId] ?? true}
                      onCheckedChange={() => handleIngredientToggle(ing.productId, ing.requirement)}
                      className="data-[state=checked]:bg-acai-green data-[state=checked]:border-acai-green"
                    />
                    <Label
                      htmlFor={`ing-${ing.productId}`}
                      className={`text-sm cursor-pointer flex-1 ${
                        ingredientSelections[ing.productId] 
                          ? "text-card-foreground" 
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {ing.productName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional ingredients (extras) */}
          {optionalIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                Adicionais
              </p>
              <div className="bg-card rounded-xl p-3 space-y-2">
                {optionalIngredients.map((ing) => (
                  <div key={ing.productId} className="flex items-center gap-3">
                    <Checkbox
                      id={`opt-${ing.productId}`}
                      checked={ingredientSelections[ing.productId] ?? false}
                      onCheckedChange={() => handleIngredientToggle(ing.productId, ing.requirement)}
                      className="data-[state=checked]:bg-acai-green data-[state=checked]:border-acai-green"
                    />
                    <Label
                      htmlFor={`opt-${ing.productId}`}
                      className={`text-sm cursor-pointer flex-1 ${
                        ingredientSelections[ing.productId] 
                          ? "text-card-foreground" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {ing.productName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={decrementQuantity}
            className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            aria-label="Diminuir quantidade"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="text-3xl font-bold text-card-foreground min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            aria-label="Aumentar quantidade"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Observations */}
        <div className="mb-6">
          <label
            htmlFor="observation"
            className="block text-sm font-semibold text-card-foreground mb-2"
          >
            Alguma observação?
          </label>
          <Textarea
            id="observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ex: Carne bem passada, pouco sal..."
            className="w-full min-h-[80px] bg-card border-border text-card-foreground placeholder:text-muted-foreground resize-none"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {observation.length}/200
          </p>
        </div>

        <Button
          onClick={handleAdd}
          className="w-full h-14 bg-acai-green hover:bg-acai-green-light text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Adicionar {formatPrice(total)}
        </Button>
      </div>
    </div>
  );
}
