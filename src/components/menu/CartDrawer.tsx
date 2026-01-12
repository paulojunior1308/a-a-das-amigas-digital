import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-acai-lilac-light rounded-t-3xl animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-card-foreground">
            Seu Pedido
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-card-foreground transition-colors hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Seu carrinho está vazio
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.product.id}-${index}`}
                className="bg-card rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-card-foreground">
                      {item.product.name}
                    </h4>
                    {item.observation && (
                      <p className="text-sm text-accent italic mt-1">
                        📝 {item.observation}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive transition-colors hover:bg-destructive/20"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-card-foreground min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-primary text-lg">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-card">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-card-foreground">
                Total
              </span>
              <span className="text-2xl font-extrabold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              onClick={onCheckout}
              className="w-full h-14 bg-acai-green hover:bg-acai-green-light text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Finalizar Pedido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
