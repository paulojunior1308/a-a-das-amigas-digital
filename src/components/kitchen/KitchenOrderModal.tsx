import { Order } from "@/contexts/OrdersContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, MessageSquare, CreditCard, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface KitchenOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkReady: (orderId: string) => void;
}

export function KitchenOrderModal({
  order,
  isOpen,
  onClose,
  onMarkReady,
}: KitchenOrderModalProps) {
  if (!order) return null;

  const minutesAgo = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
  const isBalcao = order.orderType === "balcao";

  const handleMarkReady = () => {
    onMarkReady(order.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-lg mx-auto border-2",
        isBalcao 
          ? "bg-gradient-to-br from-orange-50 to-card border-orange-400" 
          : "bg-card border-acai-purple"
      )}>
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Order type badge */}
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1",
                isBalcao 
                  ? "bg-orange-500 text-white" 
                  : "bg-acai-purple text-white"
              )}>
                {isBalcao ? (
                  <>
                    <Store className="w-4 h-4" />
                    BALCÃO
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    MESA
                  </>
                )}
              </div>
              <DialogTitle className={cn(
                "text-4xl font-bold",
                isBalcao ? "text-orange-600" : "text-acai-purple-deep"
              )}>
                #{order.comandaNumber.toString().padStart(2, "0")}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-lg">{minutesAgo} min</span>
            </div>
          </div>
          
          {/* Customer name for balcao */}
          {isBalcao && order.customerName && (
            <div className="flex items-center gap-2 mt-3 text-orange-700">
              <User className="w-5 h-5" />
              <span className="text-lg font-medium">{order.customerName}</span>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {order.items.map((item, index) => {
              const removedIngredients = item.selectedIngredients?.filter(i => !i.included) || [];
              
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border",
                    isBalcao 
                      ? "bg-orange-50 border-orange-200" 
                      : "bg-secondary/50 border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-card-foreground">
                        {item.product.name}
                      </h4>
                      {item.isComposite && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                          Produto Composto
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-2xl font-bold px-3 py-1 rounded-full",
                      isBalcao 
                        ? "bg-orange-200 text-orange-800" 
                        : "bg-acai-lilac text-acai-purple-deep"
                    )}>
                      x{item.quantity}
                    </span>
                  </div>

                  {/* Removed ingredients - very important for kitchen */}
                  {removedIngredients.length > 0 && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg border-2 border-red-400">
                      <p className="font-bold text-red-800 text-lg mb-1">
                        ⛔ SEM:
                      </p>
                      <ul className="list-disc list-inside text-red-700 font-medium">
                        {removedIngredients.map((ing, idx) => (
                          <li key={idx}>{ing.productName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {item.observation && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-amber-100 rounded-lg border border-amber-300">
                      <MessageSquare className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span className="text-base font-medium text-amber-800">
                        {item.observation}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleMarkReady}
            size="lg"
            className={cn(
              "w-full h-16 text-xl font-bold rounded-xl",
              isBalcao
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            )}
          >
            <Check className="w-6 h-6 mr-2" />
            {isBalcao ? "Pronto – Balcão" : "Marcar como Pronto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
