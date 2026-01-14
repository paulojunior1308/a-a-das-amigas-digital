import logoAcai from "@/assets/logo-acai.jpg";
import { CreditCard } from "lucide-react";

interface CardapioHeaderProps {
  comandaNumber: number | null;
}

export function CardapioHeader({ comandaNumber }: CardapioHeaderProps) {
  return (
    <header className="gradient-header sticky top-0 z-40 py-4 px-4">
      <div className="flex items-center justify-between">
        {/* Logo e Nome */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-acai-yellow shadow-lg">
            <img
              src={logoAcai}
              alt="Açaí das Amigas"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Açaí das Amigas</h1>
            <p className="text-acai-lilac-light text-xs">Cardápio Digital</p>
          </div>
        </div>

        {/* Número da Comanda */}
        {comandaNumber && (
          <div className="flex items-center gap-2 bg-acai-yellow rounded-xl px-4 py-2">
            <CreditCard className="w-5 h-5 text-acai-purple-deep" />
            <div className="text-right">
              <p className="text-xs font-medium text-acai-purple-deep/70">Comanda</p>
              <p className="text-xl font-bold text-acai-purple-deep leading-none">
                #{String(comandaNumber).padStart(2, "0")}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
