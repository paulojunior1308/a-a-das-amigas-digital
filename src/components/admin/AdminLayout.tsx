import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  ShoppingCart, 
  LogOut, 
  ChefHat, 
  Monitor,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sandwich,
  UtensilsCrossed,
  Wine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoAcai from "@/assets/logo-acai.jpg";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Relatórios", icon: FileText, path: "/admin/relatorios" },
  { title: "Estoque", icon: Package, path: "/admin/estoque" },
  { 
    title: "Produtos Compostos", 
    icon: UtensilsCrossed, 
    path: "/admin/produtos-compostos",
    children: [
      { title: "Lanches", icon: Sandwich, path: "/admin/lanches" },
      { title: "Porções", icon: UtensilsCrossed, path: "/admin/porcoes" },
      { title: "Doses", icon: Wine, path: "/admin/doses" },
    ]
  },
  { title: "PDV", icon: ShoppingCart, path: "/admin/pdv" },
];

const quickLinks: NavItem[] = [
  { title: "Cozinha", icon: ChefHat, path: "/cozinha" },
  { title: "Tela TV", icon: Monitor, path: "/tv" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    const storedUser = sessionStorage.getItem("user");

    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  // Auto-expand menu if child route is active
  useEffect(() => {
    const compositeRoutes = ["/admin/lanches", "/admin/porcoes", "/admin/doses"];
    if (compositeRoutes.some(route => location.pathname.startsWith(route))) {
      setExpandedMenus(prev => 
        prev.includes("/admin/produtos-compostos") 
          ? prev 
          : [...prev, "/admin/produtos-compostos"]
      );
    }
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.path);
    const active = hasChildren 
      ? item.children?.some(child => isActive(child.path))
      : isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleMenu(item.path)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              active
                ? "bg-primary/20 text-primary"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.title}
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
              {item.children?.map(child => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.path}
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          isActive(item.path)
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-card-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className={cn("w-5 h-5", isChild && "w-4 h-4")} />
        {item.title}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-acai-purple-deep via-acai-purple to-acai-purple-deep flex">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card/95 backdrop-blur-sm border-r border-border transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-acai-yellow">
                <img
                  src={logoAcai}
                  alt="Açaí das Amigas"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-sm">Açaí das Amigas</h1>
                <p className="text-xs text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Menu Principal
            </p>
            {navItems.map((item) => renderNavItem(item))}

            <div className="pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Acesso Rápido
              </p>
              {quickLinks.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {user?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user === "admin@acai.com" ? "Administrador" : user}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
