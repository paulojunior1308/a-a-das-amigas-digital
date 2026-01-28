import { useMemo } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from "@/contexts/OrdersContext";
import { useSales } from "@/contexts/SalesContext";
import { useStock } from "@/contexts/StockContext";
import { useProducts } from "@/contexts/ProductsContext";

export default function AdminDashboard() {
  const { orders, readyOrders } = useOrders();
  const { getTodaySales, getProductSalesCount, getTotalSales } = useSales();
  const { getLowStockItems } = useStock();
  const { products } = useProducts();

  const todaySales = useMemo(() => getTodaySales(), [getTodaySales]);
  const todayTotal = useMemo(
    () => todaySales.reduce((acc, sale) => acc + sale.total, 0),
    [todaySales]
  );
  const topProducts = useMemo(() => getProductSalesCount().slice(0, 5), [getProductSalesCount]);
  const lowStockItems = useMemo(() => getLowStockItems(), [getLowStockItems]);

  // Group orders by comanda
  const openComandas = useMemo(() => {
    const comandas = new Map<number, typeof orders>();
    [...orders, ...readyOrders].forEach((order) => {
      if (!comandas.has(order.comandaNumber)) {
        comandas.set(order.comandaNumber, []);
      }
      comandas.get(order.comandaNumber)!.push(order);
    });
    return comandas.size;
  }, [orders, readyOrders]);

  const stats = [
    {
      title: "Vendas Hoje",
      value: `R$ ${todayTotal.toFixed(2)}`,
      icon: DollarSign,
      description: `${todaySales.length} vendas realizadas`,
      color: "text-acai-green",
      bgColor: "bg-acai-green/20",
    },
    {
      title: "Comandas Abertas",
      value: openComandas,
      icon: ShoppingBag,
      description: `${orders.length} pedidos em preparo`,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Pedidos Prontos",
      value: readyOrders.length,
      icon: CheckCircle,
      description: "Aguardando retirada",
      color: "text-acai-green",
      bgColor: "bg-acai-green/20",
    },
    {
      title: "Alertas Estoque",
      value: lowStockItems.length,
      icon: AlertTriangle,
      description: "Produtos com estoque baixo",
      color: lowStockItems.length > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: lowStockItems.length > 0 ? "bg-destructive/20" : "bg-muted/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produtos Mais Vendidos */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {product.productName}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {product.count} vendas
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma venda registrada ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Estoque */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {product?.name || item.productId}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-destructive">
                          {item.quantity} un
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Mínimo: {item.minQuantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                ✅ Todos os produtos estão com estoque adequado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pedidos em Preparo */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              Pedidos em Preparo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {orders.slice(0, 6).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary">
                        Comanda #{order.comandaNumber}
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                        Preparando
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum pedido em preparo no momento
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
