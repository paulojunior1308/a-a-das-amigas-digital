import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Monitor, ShoppingCart, Lock } from "lucide-react";
import logoAcai from "@/assets/logo-acai.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Senha simples para demonstração (em produção, usar autenticação real)
  const ADMIN_PASSWORD = "acai123";

  const handleLogin = (destination: string) => {
    if (password === ADMIN_PASSWORD) {
      setError("");
      navigate(destination);
    } else {
      setError("Senha incorreta");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-acai-yellow shadow-xl mb-4">
            <img
              src={logoAcai}
              alt="Açaí das Amigas"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Açaí das Amigas</h1>
          <p className="text-acai-lilac mt-1">Painel Administrativo</p>
        </div>

        {/* Card de Login */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl">
          <div className="space-y-4 mb-6">
            <Label htmlFor="password" className="text-foreground font-medium">
              Senha de Acesso
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2 border-border focus:border-acai-purple"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleLogin("/cozinha")}
              size="lg"
              className="w-full h-16 text-lg font-bold bg-acai-yellow hover:bg-acai-yellow-dark text-acai-purple-deep rounded-xl"
            >
              <ChefHat className="w-6 h-6 mr-3" />
              Entrar na Cozinha
            </Button>

            <Button
              onClick={() => handleLogin("/tv")}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-bold border-2 border-acai-lilac text-acai-purple-deep hover:bg-acai-lilac rounded-xl"
            >
              <Monitor className="w-6 h-6 mr-3" />
              Abrir Tela da TV
            </Button>

            <Button
              onClick={() => handleLogin("/pdv")}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg font-bold border-2 border-acai-green text-acai-purple-deep hover:bg-acai-green rounded-xl"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              Abrir PDV
            </Button>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-acai-lilac/70 text-sm mt-6">
          O cardápio do cliente é acessado via QR Code
        </p>
      </div>
    </div>
  );
}
