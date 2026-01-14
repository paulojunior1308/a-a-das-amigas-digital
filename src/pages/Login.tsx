import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import logoAcai from "@/assets/logo-acai.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for demonstration
  const MOCK_CREDENTIALS = {
    email: "admin@acai.com",
    password: "admin123",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (
      (email === MOCK_CREDENTIALS.email || email === "admin") &&
      password === MOCK_CREDENTIALS.password
    ) {
      // Store mock session
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("user", email);
      navigate("/admin");
    } else {
      setError("Usuário ou senha inválidos");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-acai-yellow shadow-2xl mb-4">
            <img
              src={logoAcai}
              alt="Açaí das Amigas"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Açaí das Amigas</h1>
          <p className="text-acai-lilac mt-1 text-sm">Painel Administrativo</p>
        </div>

        {/* Card de Login */}
        <div className="bg-card rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">
                Usuário ou Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Digite seu usuário ou email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-2 border-border focus:border-acai-purple"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-2 border-border focus:border-acai-purple"
                required
              />
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold bg-acai-yellow hover:bg-acai-yellow-dark text-acai-purple-deep rounded-xl mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-acai-purple-deep border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Entrar
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Hint para demonstração */}
        <p className="text-center text-acai-lilac/50 text-xs mt-6">
          Demo: admin@acai.com / admin123
        </p>
      </div>
    </div>
  );
}
