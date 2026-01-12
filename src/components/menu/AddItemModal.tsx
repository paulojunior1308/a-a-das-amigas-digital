import { useState } from "react";
import { Product } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AddItemModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemModal({ product, isOpen, onClose }: AddItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const { addItem } = useCart();

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleAdd = () => {
    addItem(product, quantity, observation);
    setQuantity(1);
    setObservation("");
    onClose();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const total = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-acai-lilac-light rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card flex items-center justify-center text-card-foreground transition-colors hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-10 mb-6">
          <h3 className="text-xl font-bold text-card-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
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
            placeholder="Ex: Sem cebola, bem passado, pouco sal..."
            className="w-full min-h-[100px] bg-card border-border text-card-foreground placeholder:text-muted-foreground resize-none"
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
