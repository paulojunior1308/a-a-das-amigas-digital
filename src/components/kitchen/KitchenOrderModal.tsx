import { Order } from "@/contexts/OrdersContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, MessageSquare, CreditCard } from "lucide-react";

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

  const handleMarkReady = () => {
    onMarkReady(order.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-card border-2 border-acai-purple">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-acai-purple" />
              <DialogTitle className="text-4xl font-bold text-acai-purple-deep">
                Comanda #{order.comandaNumber.toString().padStart(2, "0")}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-lg">{minutesAgo} min</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-muted rounded-xl border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xl font-bold text-foreground">
                    {item.product.name}
                  </h4>
                  <span className="text-2xl font-bold text-acai-purple-deep bg-acai-lilac px-3 py-1 rounded-full">
                    x{item.quantity}
                  </span>
                </div>
                
                {item.observation && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-acai-yellow/10 rounded-lg border border-acai-yellow/30">
                    <MessageSquare className="w-5 h-5 text-acai-yellow-dark flex-shrink-0 mt-0.5" />
                    <span className="text-base font-medium text-acai-yellow-dark">
                      {item.observation}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleMarkReady}
            size="lg"
            className="w-full h-16 text-xl font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl"
          >
            <Check className="w-6 h-6 mr-2" />
            Marcar como Pronto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
