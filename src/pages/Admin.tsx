import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, Monitor, ShoppingCart, LogOut, QrCode } from "lucide-react";
import logoAcai from "@/assets/logo-acai.jpg";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Check mock authentication
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    const storedUser = sessionStorage.getItem("user");

    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    {
      title: "Cozinha",
      description: "Gerenciar pedidos em preparo",
      icon: ChefHat,
      path: "/cozinha",
      color: "bg-acai-yellow hover:bg-acai-yellow-dark text-acai-purple-deep",
    },
    {
      title: "PDV",
      description: "Ponto de venda e comandas",
      icon: ShoppingCart,
      path: "/pdv",
      color: "bg-acai-green hover:bg-acai-green/90 text-white",
    },
    {
      title: "Tela TV",
      description: "Exibição de pedidos prontos",
      icon: Monitor,
      path: "/tv",
      color: "bg-acai-lilac hover:bg-acai-lilac/90 text-acai-purple-deep",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-acai-yellow">
              <img
                src={logoAcai}
                alt="Açaí das Amigas"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Açaí das Amigas</h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">
            Olá, {user === "admin@acai.com" ? "Administrador" : user}!
          </h2>
          <p className="text-acai-lilac">Selecione uma opção para continuar</p>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`${item.color} rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
            >
              <item.icon className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-1">{item.title}</h3>
              <p className="text-sm opacity-80">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Quick Info */}
        <div className="mt-8 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-acai-purple/20 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 text-acai-lilac" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Acesso do Cliente</h3>
              <p className="text-sm text-acai-lilac/80">
                Os clientes acessam o cardápio através do QR Code em cada mesa. 
                O link segue o formato: <code className="bg-acai-purple/30 px-2 py-0.5 rounded text-xs">/cardapio?comanda=XX</code>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
