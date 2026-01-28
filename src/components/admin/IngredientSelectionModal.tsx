import React, { useState, useEffect } from "react";
import { X, Minus, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CompositeProduct, CompositeIngredient, SelectedIngredient } from "@/types/compositeProduct";

interface IngredientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CompositeProduct;
  onConfirm: (selectedIngredients: SelectedIngredient[], observation: string, quantity: number) => void;
}

export default function IngredientSelectionModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: IngredientSelectionModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);

  // Initialize ingredients when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setSelectedIngredients(
        product.ingredients.map((ing) => ({
          productId: ing.productId,
          productName: ing.productName,
          quantity: ing.quantity,
          measureUnit: ing.measureUnit,
          included: ing.isDefault,
        }))
      );
      setQuantity(1);
      setObservation("");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleToggleIngredient = (productId: string) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.productId === productId ? { ...ing, included: !ing.included } : ing
      )
    );
  };

  const canToggle = (ingredient: CompositeIngredient) => {
    return ingredient.requirement !== "required";
  };

  const getIngredientRequirement = (productId: string) => {
    return product.ingredients.find((i) => i.productId === productId)?.requirement;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedIngredients, observation.trim(), quantity);
    onClose();
  };

  const removedIngredients = selectedIngredients.filter((ing) => !ing.included);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-card-foreground">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-card-foreground transition-colors hover:bg-muted/80"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingredients List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Ingredientes</h3>
            <div className="space-y-2">
              {product.ingredients.map((ingredient) => {
                const selected = selectedIngredients.find(
                  (s) => s.productId === ingredient.productId
                );
                const isRequired = ingredient.requirement === "required";
                const isIncluded = selected?.included ?? ingredient.isDefault;

                return (
                  <div
                    key={ingredient.productId}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isIncluded ? "bg-muted/50" : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`ing-${ingredient.productId}`}
                        checked={isIncluded}
                        onCheckedChange={() => handleToggleIngredient(ingredient.productId)}
                        disabled={isRequired}
                      />
                      <Label
                        htmlFor={`ing-${ingredient.productId}`}
                        className={`cursor-pointer ${
                          !isIncluded ? "line-through text-muted-foreground" : "text-card-foreground"
                        }`}
                      >
                        {ingredient.productName}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {ingredient.quantity}{ingredient.measureUnit}
                      </span>
                      {isRequired && (
                        <Badge variant="secondary" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Removed ingredients summary */}
          {removedIngredients.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm font-medium text-orange-800 mb-1">
                Ingredientes removidos:
              </p>
              <p className="text-sm text-orange-700">
                {removedIngredients.map((ing) => ing.productName).join(", ")}
              </p>
            </div>
          )}

          {/* Observation */}
          <div>
            <Label htmlFor="observation" className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              Observações
            </Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Carne ao ponto, pouco sal..."
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <Label>Quantidade</Label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-card-foreground transition-transform hover:scale-110 active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold text-card-foreground min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-card-foreground transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-card-foreground font-medium">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price * quantity)}
            </span>
          </div>
          <Button
            onClick={handleConfirm}
            className="w-full h-12 bg-acai-green hover:bg-acai-green-light text-white font-bold text-lg"
          >
            Adicionar ao Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
