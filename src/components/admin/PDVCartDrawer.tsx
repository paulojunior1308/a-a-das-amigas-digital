import { PDVCartItem } from "@/types/admin";
import { X, Minus, Plus, Trash2, User, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PDVCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: PDVCartItem[];
  cartTotal: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  hasItemsNeedingPreparation: boolean;
  onUpdateQuantity: (productId: string, delta: number, isPortion?: boolean, portionId?: string) => void;
  onRemoveItem: (productId: string, isPortion?: boolean, portionId?: string) => void;
  onFinalize: () => void;
}

export function PDVCartDrawer({
  isOpen,
  onClose,
  cart,
  cartTotal,
  customerName,
  setCustomerName,
  hasItemsNeedingPreparation,
  onUpdateQuantity,
  onRemoveItem,
  onFinalize,
}: PDVCartDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in lg:hidden">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full bg-card rounded-t-3xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Carrinho PDV
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground transition-colors hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Carrinho vazio
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.isPortion ? item.portionId : item.productId}
                className="bg-secondary/50 rounded-xl p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground text-sm">
                        {item.productName}
                      </h4>
                      {item.isPortion && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded">
                          Porção
                        </span>
                      )}
                      {item.needsPreparation && (
                        <ChefHat className="w-3 h-3 text-acai-yellow" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      R$ {item.unitPrice.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId, item.isPortion, item.portionId)}
                    className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive transition-colors hover:bg-destructive/20"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, -1, item.isPortion, item.portionId)}
                      className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-foreground min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, 1, item.isPortion, item.portionId)}
                      className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-primary text-lg">
                    R$ {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Name & Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-card space-y-4">
            {/* Customer name field - only shows when there are items needing preparation */}
            {hasItemsNeedingPreparation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Nome do cliente (opcional)</span>
                </div>
                <Input
                  placeholder="Ex: João, Ana, Retirada..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-acai-yellow flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  Itens serão enviados para a cozinha
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">
                Total
              </span>
              <span className="text-2xl font-extrabold text-primary">
                R$ {cartTotal.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={onFinalize}
              className="w-full h-14 bg-acai-green hover:bg-acai-green/90 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Finalizar Venda
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
