import { useState, useMemo, useCallback } from "react";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  QrCode,
  X,
  Camera,
  Banknote,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/contexts/ProductsContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useSales } from "@/contexts/SalesContext";
import { useStock } from "@/contexts/StockContext";
import { PDVCartItem, Sale } from "@/types/admin";
import { toast } from "sonner";
import QRCodeScanner from "./QRCodeScanner";

export default function AdminPDV() {
  const { products, categories } = useProducts();
  const { orders, readyOrders, removeReadyOrder } = useOrders();
  const { addSale } = useSales();
  const { decreaseStock } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [cart, setCart] = useState<PDVCartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Sale["paymentMethod"]>("dinheiro");
  const [currentComanda, setCurrentComanda] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCurrentComanda(null);
  };

  const handleOpenQRScanner = () => {
    setQrInput("");
    setShowQRModal(true);
  };

  const loadComandaByNumber = useCallback((comandaNumber: number) => {
    if (isNaN(comandaNumber) || comandaNumber <= 0) {
      toast.error("Número de comanda inválido");
      return;
    }

    // Find all orders for this comanda (both preparing and ready)
    const allOrders = [...orders, ...readyOrders];
    const comandaOrders = allOrders.filter((o) => o.comandaNumber === comandaNumber);

    if (comandaOrders.length === 0) {
      toast.error(`Nenhum pedido encontrado para a comanda #${comandaNumber}`);
      return;
    }

    // Check if all orders are ready
    const hasPreparingOrders = comandaOrders.some((o) => o.status === "preparing");
    if (hasPreparingOrders) {
      toast.warning("Alguns pedidos ainda estão em preparo");
    }

    // Add all items to cart
    const items: PDVCartItem[] = [];
    comandaOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existingItem = items.find((i) => i.productId === item.product.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          items.push({
            productId: item.product.id,
            productName: item.product.name,
            unitPrice: item.product.price,
            quantity: item.quantity,
          });
        }
      });
    });

    setCart(items);
    setCurrentComanda(comandaNumber);
    setShowQRModal(false);
    toast.success(`Comanda #${comandaNumber} carregada com ${items.length} itens`);
  }, [orders, readyOrders]);

  const handleScanComanda = () => {
    const comandaNumber = parseInt(qrInput);
    loadComandaByNumber(comandaNumber);
  };

  const handleQRScanSuccess = (decodedText: string) => {
    // Try to extract comanda number from QR code
    // QR code might be just a number or a URL with number
    let comandaNumber: number;
    
    // Try to parse as number first
    comandaNumber = parseInt(decodedText);
    
    // If not a direct number, try to extract from URL or other format
    if (isNaN(comandaNumber)) {
      const match = decodedText.match(/comanda[=\/:]?(\d+)/i);
      if (match) {
        comandaNumber = parseInt(match[1]);
      }
    }
    
    if (!isNaN(comandaNumber) && comandaNumber > 0) {
      loadComandaByNumber(comandaNumber);
    } else {
      toast.error("QR Code inválido. Não foi possível identificar o número da comanda.");
    }
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    // Create sale record
    const sale: Omit<Sale, "id" | "createdAt"> = {
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
      total: cartTotal,
      type: currentComanda ? "comanda" : "pdv",
      comandaNumber: currentComanda || undefined,
      paymentMethod: selectedPayment,
    };

    // Add sale
    addSale(sale);

    // Update stock
    cart.forEach((item) => {
      decreaseStock(item.productId, item.quantity);
    });

    // If it's a comanda, remove the ready orders
    if (currentComanda) {
      const comandaReadyOrders = readyOrders.filter(
        (o) => o.comandaNumber === currentComanda
      );
      comandaReadyOrders.forEach((order) => {
        removeReadyOrder(order.id);
      });
    }

    toast.success(
      currentComanda
        ? `Comanda #${currentComanda} finalizada!`
        : "Venda finalizada com sucesso!"
    );

    clearCart();
    setShowPaymentModal(false);
  };

  const paymentMethods = [
    { id: "dinheiro", label: "Dinheiro", icon: Banknote },
    { id: "pix", label: "PIX", icon: Smartphone },
    { id: "cartao_debito", label: "Débito", icon: CreditCard },
    { id: "cartao_credito", label: "Crédito", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">PDV - Ponto de Venda</h1>
          <p className="text-acai-lilac">Vendas diretas e fechamento de comandas</p>
        </div>
        <Button
          onClick={handleOpenQRScanner}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Fechar Comanda
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48 bg-secondary border-border">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 text-left hover:bg-secondary/80 transition-all active:scale-95"
              >
                <p className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                  {product.name}
                </p>
                <p className="text-primary font-bold">R$ {product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho
                </span>
                {currentComanda && (
                  <span className="text-sm font-normal bg-accent/20 text-accent px-2 py-1 rounded-full">
                    Comanda #{currentComanda}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            R$ {item.unitPrice.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartQuantity(item.productId, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateCartQuantity(item.productId, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="flex-1 border-border"
                      >
                        Limpar
                      </Button>
                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="flex-1 bg-acai-green text-white hover:bg-acai-green/90"
                      >
                        Finalizar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Carrinho vazio</p>
                  <p className="text-xs mt-1">Clique nos produtos para adicionar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Fechar Comanda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* QR Code Scanner */}
            <QRCodeScanner 
              onScanSuccess={handleQRScanSuccess}
              onScanError={(err) => console.log("Scanner error:", err)}
            />
            
            {/* Manual input divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou digite manualmente</span>
              </div>
            </div>

            {/* Manual number input */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Número da Comanda
              </label>
              <Input
                type="number"
                placeholder="Ex: 101"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="bg-secondary border-border text-lg text-center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleScanComanda}
              disabled={!qrInput}
              className="bg-primary text-primary-foreground"
            >
              Carregar Comanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-3xl font-bold text-primary">
                R$ {cartTotal.toFixed(2)}
              </p>
              {currentComanda && (
                <p className="text-sm text-accent mt-1">Comanda #{currentComanda}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id as Sale["paymentMethod"])}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      selectedPayment === method.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleFinalizeSale}
              className="bg-acai-green text-white hover:bg-acai-green/90"
            >
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
