import { useState, useMemo, useCallback } from "react";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  QrCode,
  AlertTriangle,
  Banknote,
  Smartphone,
  ChefHat,
  User,
  Sandwich
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProducts } from "@/contexts/ProductsContext";
import { usePortions } from "@/contexts/PortionsContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useSales } from "@/contexts/SalesContext";
import { useStock } from "@/contexts/StockContext";
import { useCompositeProducts } from "@/contexts/CompositeProductsContext";
import { PDVCartItem, Sale } from "@/types/admin";
import { CompositeProduct, SelectedIngredient } from "@/types/compositeProduct";
import { toast } from "sonner";
import QRCodeScanner from "./QRCodeScanner";
import { PDVCartFAB } from "./PDVCartFAB";
import { PDVCartDrawer } from "./PDVCartDrawer";
import IngredientSelectionModal from "./IngredientSelectionModal";

export default function AdminPDV() {
  const { products, categories, getWholeProducts } = useProducts();
  const { portions, getActivePortions } = usePortions();
  const { compositeProducts, getActiveByType } = useCompositeProducts();
  const { orders, readyOrders, removeReadyOrder, addBalcaoOrder } = useOrders();
  const { addSale } = useSales();
  const { decreaseStock, decreaseFractionalStock, checkFractionalStockAvailable } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [cart, setCart] = useState<PDVCartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Sale["paymentMethod"]>("dinheiro");
  const [currentComanda, setCurrentComanda] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [customerName, setCustomerName] = useState("");
  
  // Composite product selection state
  const [selectedComposite, setSelectedComposite] = useState<CompositeProduct | null>(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  // Filter products (only whole products for direct sale)
  const wholeProducts = getWholeProducts().filter(p => p.active !== false && p.price > 0);
  const activePortions = getActivePortions();
  const activeLanches = getActiveByType("lanche");
  const activePorcoes = getActiveByType("porcao");
  const activeDoses = getActiveByType("dose");

  const filteredProducts = useMemo(() => {
    return wholeProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [wholeProducts, searchTerm, filterCategory]);

  const filteredPortions = useMemo(() => {
    return activePortions.filter((portion) => {
      const matchesSearch = portion.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || portion.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activePortions, searchTerm, filterCategory]);

  // All composite products combined and filtered
  const filteredComposites = useMemo(() => {
    const allComposites = [...activeLanches, ...activePorcoes, ...activeDoses];
    return allComposites.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [activeLanches, activePorcoes, activeDoses, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Check if any item in cart needs preparation
  const hasItemsNeedingPreparation = useMemo(() => {
    return cart.some(item => item.needsPreparation);
  }, [cart]);

  // Check if portion has sufficient stock
  const checkPortionStock = useCallback((portionId: string, quantity: number = 1) => {
    const portion = portions.find(p => p.id === portionId);
    if (!portion) return { available: false, missing: [] as string[] };

    const missing: string[] = [];
    for (const ingredient of portion.ingredients) {
      const neededAmount = ingredient.consumeAmount * quantity;
      if (!checkFractionalStockAvailable(ingredient.productId, neededAmount)) {
        missing.push(ingredient.productName);
      }
    }

    return { available: missing.length === 0, missing };
  }, [portions, checkFractionalStockAvailable]);

  // Open ingredient selection for composite products
  const openCompositeSelection = (composite: CompositeProduct) => {
    setSelectedComposite(composite);
    setShowIngredientModal(true);
  };

  // Add composite product to cart after ingredient selection
  const addCompositeToCart = (
    selectedIngredients: SelectedIngredient[],
    observation: string,
    quantity: number
  ) => {
    if (!selectedComposite) return;

    // Generate unique ID for this cart item (to allow same product with different ingredients)
    const cartItemId = `${selectedComposite.id}-${Date.now()}`;

    setCart([
      ...cart,
      {
        productId: cartItemId,
        productName: selectedComposite.name,
        unitPrice: selectedComposite.price,
        quantity,
        isComposite: true,
        compositeId: selectedComposite.id,
        needsPreparation: selectedComposite.needsPreparation,
        observation,
        selectedIngredients: selectedIngredients.map(ing => ({
          productId: ing.productId,
          productName: ing.productName,
          quantity: ing.quantity,
          measureUnit: ing.measureUnit,
          included: ing.included,
        })),
      },
    ]);

    const removedCount = selectedIngredients.filter(i => !i.included).length;
    if (removedCount > 0) {
      toast.success(`${selectedComposite.name} adicionado com ${removedCount} ingrediente(s) removido(s)`);
    } else {
      toast.success(`${selectedComposite.name} adicionado ao pedido`);
    }
    
    setSelectedComposite(null);
  };

  const addToCart = (product: typeof wholeProducts[0]) => {
    const existingItem = cart.find((item) => item.productId === product.id && !item.isPortion);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id && !item.isPortion
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
          isPortion: false,
          needsPreparation: product.needsPreparation || false,
        },
      ]);
    }
  };

  const addPortionToCart = (portion: typeof activePortions[0]) => {
    // Check stock availability
    const stockCheck = checkPortionStock(portion.id, 1);
    if (!stockCheck.available) {
      toast.error(`Estoque insuficiente: ${stockCheck.missing.join(", ")}`);
      return;
    }

    const existingItem = cart.find((item) => item.portionId === portion.id);
    if (existingItem) {
      // Check if adding one more is possible
      const newQty = existingItem.quantity + 1;
      const stockCheckNew = checkPortionStock(portion.id, newQty);
      if (!stockCheckNew.available) {
        toast.error(`Estoque insuficiente para adicionar mais: ${stockCheckNew.missing.join(", ")}`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.portionId === portion.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: portion.id,
          productName: portion.name,
          unitPrice: portion.price,
          quantity: 1,
          isPortion: true,
          portionId: portion.id,
          needsPreparation: true, // Portions always need preparation
        },
      ]);
    }
  };

  const updateCartQuantity = (productId: string, delta: number, isPortion?: boolean, portionId?: string) => {
    // For portions, check stock when increasing
    if (isPortion && delta > 0 && portionId) {
      const currentItem = cart.find(i => i.portionId === portionId);
      const newQty = (currentItem?.quantity || 0) + delta;
      const stockCheck = checkPortionStock(portionId, newQty);
      if (!stockCheck.available) {
        toast.error(`Estoque insuficiente: ${stockCheck.missing.join(", ")}`);
        return;
      }
    }

    setCart(
      cart
        .map((item) => {
          if (isPortion && item.portionId === portionId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          if (!isPortion && item.productId === productId && !item.isPortion) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string, isPortion?: boolean, portionId?: string) => {
    if (isPortion) {
      setCart(cart.filter((item) => item.portionId !== portionId));
    } else {
      setCart(cart.filter((item) => !(item.productId === productId && !item.isPortion)));
    }
  };

  const clearCart = () => {
    setCart([]);
    setCurrentComanda(null);
    setCustomerName("");
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

    const allOrders = [...orders, ...readyOrders];
    const comandaOrders = allOrders.filter((o) => o.comandaNumber === comandaNumber && o.orderType === "comanda");

    if (comandaOrders.length === 0) {
      toast.error(`Nenhum pedido encontrado para a comanda #${comandaNumber}`);
      return;
    }

    const hasPreparingOrders = comandaOrders.some((o) => o.status === "preparing");
    if (hasPreparingOrders) {
      toast.warning("Alguns pedidos ainda estão em preparo");
    }

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
            needsPreparation: item.product.needsPreparation,
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
    let comandaNumber: number;
    comandaNumber = parseInt(decodedText);
    
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

    // Validate stock for portions
    for (const item of cart) {
      if (item.isPortion && item.portionId) {
        const stockCheck = checkPortionStock(item.portionId, item.quantity);
        if (!stockCheck.available) {
          toast.error(`Estoque insuficiente para "${item.productName}": ${stockCheck.missing.join(", ")}`);
          return;
        }
      }
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

    addSale(sale);

    // Update stock
    cart.forEach((item) => {
      if (item.isPortion && item.portionId) {
        // Decrease fractional stock for portions
        const portion = portions.find(p => p.id === item.portionId);
        if (portion) {
          portion.ingredients.forEach(ingredient => {
            const consumeTotal = ingredient.consumeAmount * item.quantity;
            decreaseFractionalStock(ingredient.productId, consumeTotal);
          });
        }
      } else {
        // Decrease regular stock
        decreaseStock(item.productId, item.quantity);
      }
    });

    // If it's a comanda from cardapio, remove the ready orders
    if (currentComanda) {
      const comandaReadyOrders = readyOrders.filter(
        (o) => o.comandaNumber === currentComanda && o.orderType === "comanda"
      );
      comandaReadyOrders.forEach((order) => {
        removeReadyOrder(order.id);
      });
    }

    // If there are items needing preparation AND it's a PDV sale (not comanda), create balcao order
    if (!currentComanda && hasItemsNeedingPreparation) {
      const balcaoNumber = addBalcaoOrder(cart, customerName || undefined);
      toast.success(`Venda finalizada! Pedido BALCÃO #${balcaoNumber} enviado para cozinha.`);
    } else {
      toast.success(
        currentComanda
          ? `Comanda #${currentComanda} finalizada!`
          : "Venda finalizada com sucesso!"
      );
    }

    clearCart();
    setShowPaymentModal(false);
    setShowMobileCart(false);
  };

  const paymentMethods = [
    { id: "dinheiro", label: "Dinheiro", icon: Banknote },
    { id: "pix", label: "PIX", icon: Smartphone },
    { id: "cartao_debito", label: "Débito", icon: CreditCard },
    { id: "cartao_credito", label: "Crédito", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
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
          {/* Tabs and Search */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="products">Produtos</TabsTrigger>
                  <TabsTrigger value="composites" className="flex items-center gap-1">
                    <Sandwich className="w-3 h-3" />
                    Lanches
                  </TabsTrigger>
                  <TabsTrigger value="portions">Porções</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      activeTab === "products" 
                        ? "Buscar produto..." 
                        : activeTab === "composites"
                        ? "Buscar lanche, porção ou dose..."
                        : "Buscar porção..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                {activeTab !== "composites" && (
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
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products/Composites/Portions Grid */}
          {activeTab === "products" && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 text-left hover:bg-secondary/80 transition-all active:scale-95"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="font-medium text-foreground text-sm line-clamp-2">
                      {product.name}
                    </p>
                    {product.needsPreparation && (
                      <ChefHat className="w-3 h-3 text-acai-yellow shrink-0" />
                    )}
                  </div>
                  <p className="text-primary font-bold">R$ {product.price.toFixed(2)}</p>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  Nenhum produto encontrado
                </p>
              )}
            </div>
          )}

          {activeTab === "composites" && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {filteredComposites.map((composite) => {
                const typeLabel = composite.type === "lanche" ? "Lanche" : composite.type === "porcao" ? "Porção" : "Dose";
                const typeColor = composite.type === "lanche" ? "bg-orange-500/20 text-orange-300" : composite.type === "porcao" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300";
                return (
                  <button
                    key={composite.id}
                    onClick={() => openCompositeSelection(composite)}
                    className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 text-left hover:bg-secondary/80 transition-all active:scale-95"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="font-medium text-foreground text-sm line-clamp-2">
                        {composite.name}
                      </p>
                      <ChefHat className="w-3 h-3 text-acai-yellow shrink-0" />
                    </div>
                    <p className="text-primary font-bold">R$ {composite.price.toFixed(2)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${typeColor}`}>
                      {typeLabel}
                    </span>
                  </button>
                );
              })}
              {filteredComposites.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  Nenhum produto composto encontrado
                </p>
              )}
            </div>
          )}

          {activeTab === "portions" && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {filteredPortions.map((portion) => {
                const stockCheck = checkPortionStock(portion.id, 1);
                return (
                  <button
                    key={portion.id}
                    onClick={() => addPortionToCart(portion)}
                    disabled={!stockCheck.available}
                    className={`bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 text-left transition-all ${
                      stockCheck.available 
                        ? "hover:bg-secondary/80 active:scale-95" 
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                        {portion.name}
                      </p>
                      {!stockCheck.available && (
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                      )}
                    </div>
                    <p className="text-primary font-bold">R$ {portion.price.toFixed(2)}</p>
                    {!stockCheck.available && (
                      <p className="text-xs text-destructive mt-1">Estoque insuficiente</p>
                    )}
                  </button>
                );
              })}
              {filteredPortions.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  Nenhuma porção encontrada
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cart Section - Desktop only */}
        <div className="lg:col-span-1 hidden lg:block">
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
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => {
                      const removedIngredients = item.selectedIngredients?.filter(i => !i.included) || [];
                      return (
                        <div
                          key={item.isComposite ? item.productId : item.isPortion ? item.portionId : item.productId}
                          className="p-2 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {item.productName}
                                </p>
                                {item.isComposite && (
                                  <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1 rounded">
                                    Composto
                                  </span>
                                )}
                                {item.isPortion && !item.isComposite && (
                                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded">
                                    Porção
                                  </span>
                                )}
                                {item.needsPreparation && (
                                  <ChefHat className="w-3 h-3 text-acai-yellow shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                R$ {item.unitPrice.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!item.isComposite && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateCartQuantity(item.productId, -1, item.isPortion, item.portionId)}
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
                                    onClick={() => updateCartQuantity(item.productId, 1, item.isPortion, item.portionId)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {item.isComposite && (
                                <span className="w-6 text-center text-sm font-medium text-foreground">
                                  {item.quantity}x
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeFromCart(item.productId, item.isPortion, item.portionId)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          {/* Show removed ingredients for composite products */}
                          {removedIngredients.length > 0 && (
                            <p className="text-[10px] text-orange-400 mt-1">
                              Sem: {removedIngredients.map(i => i.productName).join(", ")}
                            </p>
                          )}
                          {/* Show observation */}
                          {item.observation && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">
                              📝 {item.observation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer name field - only for PDV sales with preparation items */}
                  {!currentComanda && hasItemsNeedingPreparation && (
                    <div className="space-y-2 p-3 bg-acai-yellow/10 rounded-lg border border-acai-yellow/30">
                      <div className="flex items-center gap-2 text-sm text-acai-yellow-dark">
                        <ChefHat className="w-4 h-4" />
                        <span>Itens serão enviados para cozinha</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Nome do cliente (opcional)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="bg-secondary border-border h-8 text-sm"
                        />
                      </div>
                    </div>
                  )}

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

      {/* Mobile Cart FAB */}
      <PDVCartFAB
        itemCount={cartItemCount}
        total={cartTotal}
        onClick={() => setShowMobileCart(true)}
      />

      {/* Mobile Cart Drawer */}
      <PDVCartDrawer
        isOpen={showMobileCart}
        onClose={() => setShowMobileCart(false)}
        cart={cart}
        cartTotal={cartTotal}
        customerName={customerName}
        setCustomerName={setCustomerName}
        hasItemsNeedingPreparation={hasItemsNeedingPreparation && !currentComanda}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onFinalize={() => {
          setShowMobileCart(false);
          setShowPaymentModal(true);
        }}
      />

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
            <QRCodeScanner 
              onScanSuccess={handleQRScanSuccess}
              onScanError={(err) => console.log("Scanner error:", err)}
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou digite manualmente</span>
              </div>
            </div>

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
            <Button 
              variant="outline" 
              onClick={() => setShowQRModal(false)}
              className="bg-acai-purple-deep text-white border-acai-purple-deep hover:bg-acai-purple-dark"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleScanComanda}
              disabled={!qrInput}
              className="bg-primary text-acai-purple-deep hover:bg-primary/90 disabled:opacity-50"
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
              {!currentComanda && hasItemsNeedingPreparation && (
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-acai-yellow">
                  <ChefHat className="w-4 h-4" />
                  <span>Pedido será enviado para cozinha</span>
                </div>
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
                        : "border-border text-foreground hover:bg-secondary"
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
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentModal(false)}
              className="bg-acai-purple-deep text-white border-acai-purple-deep hover:bg-acai-purple-dark"
            >
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

      {/* Ingredient Selection Modal for Composite Products */}
      {selectedComposite && (
        <IngredientSelectionModal
          isOpen={showIngredientModal}
          onClose={() => {
            setShowIngredientModal(false);
            setSelectedComposite(null);
          }}
          product={selectedComposite}
          onConfirm={addCompositeToCart}
        />
      )}
    </div>
  );
}
