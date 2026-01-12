import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSuccessProps {
  orderNumber: number;
  onNewOrder: () => void;
}

export function OrderSuccess({ orderNumber, onNewOrder }: OrderSuccessProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-acai-purple-deep p-6 animate-fade-in">
      <div className="text-center max-w-sm">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-acai-green flex items-center justify-center animate-bounce-soft">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-primary mb-2">
          Pedido Recebido!
        </h1>

        <div className="bg-acai-lilac rounded-2xl p-6 mb-6 shadow-lg">
          <p className="text-muted-foreground text-sm mb-1">Número do pedido</p>
          <p className="text-5xl font-extrabold text-card-foreground">
            #{String(orderNumber).padStart(2, "0")}
          </p>
        </div>

        <p className="text-acai-lilac-light text-lg mb-8 leading-relaxed">
          Aguarde a chamada no<br />
          <span className="font-bold text-primary">painel do salão</span>
        </p>

        <Button
          onClick={onNewOrder}
          variant="outline"
          className="px-8 py-6 text-lg font-semibold border-2 border-acai-lilac text-acai-lilac hover:bg-acai-lilac hover:text-card-foreground rounded-xl transition-all"
        >
          Fazer Novo Pedido
        </Button>
      </div>
    </div>
  );
}
