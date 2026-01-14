import { CheckCircle } from "lucide-react";

interface OrderSentProps {
  comandaNumber: number | null;
}

export function OrderSent({ comandaNumber }: OrderSentProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-none">
      <div className="bg-card rounded-3xl p-8 shadow-2xl text-center max-w-xs mx-4 animate-bounce-soft">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-acai-green flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Pedido Enviado!
        </h2>
        
        <p className="text-muted-foreground mb-4">
          Seu pedido foi enviado para a cozinha
        </p>

        {comandaNumber && (
          <div className="bg-acai-lilac rounded-xl px-4 py-2 inline-block">
            <p className="text-sm text-muted-foreground">Comanda</p>
            <p className="text-2xl font-bold text-acai-purple-deep">
              #{String(comandaNumber).padStart(2, "0")}
            </p>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mt-4">
          Continue pedindo se quiser!
        </p>
      </div>
    </div>
  );
}
