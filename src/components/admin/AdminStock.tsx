import { useState } from "react";
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/contexts/ProductsContext";
import { useStock } from "@/contexts/StockContext";
import { Product, ProductType, MeasureUnit } from "@/types/menu";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  category: string;
  productType: ProductType;
  measureUnit: MeasureUnit;
  unitVolume: string;
  stockUnits: string;
  active: boolean;
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  category: "",
  productType: "whole",
  measureUnit: "g",
  unitVolume: "",
  stockUnits: "",
  active: true,
};

export default function AdminStock() {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useProducts();
  const { stock, updateStock, setMinQuantity } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [productForm, setProductForm] = useState<ProductFormData>(defaultFormData);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesType = filterType === "all" || product.productType === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || "",
        category: product.category,
        productType: product.productType,
        measureUnit: product.measureUnit || "g",
        unitVolume: product.unitVolume?.toString() || "",
        stockUnits: product.stockUnits?.toString() || "",
        active: product.active !== false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({ ...defaultFormData, category: categories[0]?.id || "" });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (productForm.productType === "whole" && !productForm.price) {
      toast.error("Informe o preço de venda");
      return;
    }

    if (productForm.productType === "fractional" && (!productForm.unitVolume || !productForm.stockUnits)) {
      toast.error("Preencha o volume da unidade e estoque inicial");
      return;
    }

    const productData: Omit<Product, "id"> = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price) || 0,
      costPrice: parseFloat(productForm.costPrice) || undefined,
      category: productForm.category,
      productType: productForm.productType,
      active: productForm.active,
    };

    if (productForm.productType === "fractional") {
      productData.measureUnit = productForm.measureUnit;
      productData.unitVolume = parseFloat(productForm.unitVolume);
      productData.stockUnits = parseFloat(productForm.stockUnits);
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success("Produto atualizado com sucesso!");
    } else {
      addProduct(productData);
      toast.success("Produto adicionado com sucesso!");
    }

    setShowProductModal(false);
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Deseja realmente excluir "${product.name}"?`)) {
      deleteProduct(product.id);
      toast.success("Produto excluído com sucesso!");
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }
    addCategory({ name: newCategoryName.trim() });
    setNewCategoryName("");
    setShowCategoryModal(false);
    toast.success("Categoria adicionada com sucesso!");
  };

  const handleStockChange = (productId: string, value: string, product: Product) => {
    const qty = parseFloat(value) || 0;
    if (product.productType === "fractional") {
      // For fractional, user inputs units, we store total volume
      const totalVolume = qty * (product.unitVolume || 1);
      updateStock(productId, totalVolume);
    } else {
      updateStock(productId, qty);
    }
  };

  const handleMinQtyChange = (productId: string, value: string) => {
    const qty = parseFloat(value) || 0;
    setMinQuantity(productId, qty);
  };

  const getStockDisplay = (product: Product, stockItem: typeof stock[0] | undefined) => {
    if (!stockItem) return { value: 0, display: "0 un", status: "normal" as const };
    
    if (product.productType === "fractional") {
      const volume = stockItem.quantity;
      const unit = product.measureUnit || "g";
      const display = volume >= 1000 
        ? `${(volume / 1000).toFixed(2)} ${unit === "g" ? "kg" : "L"}`
        : `${volume.toFixed(0)} ${unit}`;
      
      const status = volume === 0 ? "empty" : volume <= stockItem.minQuantity ? "low" : "normal";
      return { value: volume, display, status };
    } else {
      const status = stockItem.quantity === 0 ? "empty" : stockItem.quantity <= stockItem.minQuantity ? "low" : "normal";
      return { value: stockItem.quantity, display: `${stockItem.quantity} un`, status };
    }
  };

  const getStockUnitsForInput = (product: Product, stockItem: typeof stock[0] | undefined) => {
    if (!stockItem) return 0;
    if (product.productType === "fractional" && product.unitVolume) {
      return stockItem.quantity / product.unitVolume;
    }
    return stockItem.quantity;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Controle de Estoque</h1>
          <p className="text-acai-lilac">Gerencie produtos e categorias</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCategoryModal(true)}
            variant="outline"
            className="bg-secondary/50 border-border text-foreground hover:bg-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Categoria
          </Button>
          <Button
            onClick={() => handleOpenProductModal()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Produto
          </Button>
        </div>
      </div>

      {/* Filters */}
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
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                <SelectItem value="whole">Inteiro</SelectItem>
                <SelectItem value="fractional">Fracionado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="w-5 h-5" />
            Produtos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-foreground">Produto</TableHead>
                  <TableHead className="text-foreground">Tipo</TableHead>
                  <TableHead className="text-foreground">Categoria</TableHead>
                  <TableHead className="text-foreground text-right">Preço</TableHead>
                  <TableHead className="text-foreground text-center">Estoque</TableHead>
                  <TableHead className="text-foreground text-center">Volume Un.</TableHead>
                  <TableHead className="text-foreground text-center">Status</TableHead>
                  <TableHead className="text-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockItem = stock.find((s) => s.productId === product.id);
                  const stockDisplay = getStockDisplay(product, stockItem);
                  const category = categories.find((c) => c.id === product.category);

                  return (
                    <TableRow key={product.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {stockDisplay.status === "low" && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                          )}
                          {stockDisplay.status === "empty" && (
                            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.productType === "fractional" 
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-green-500/20 text-green-300"
                        }`}>
                          {product.productType === "fractional" ? "Fracionado" : "Inteiro"}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {category?.name || product.category}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {product.price > 0 ? `R$ ${product.price.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step={product.productType === "fractional" ? "0.1" : "1"}
                            value={getStockUnitsForInput(product, stockItem)}
                            onChange={(e) => handleStockChange(product.id, e.target.value, product)}
                            className={`w-20 text-center ${
                              stockDisplay.status === "low"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : stockDisplay.status === "empty"
                                ? "border-destructive bg-destructive/20"
                                : "bg-secondary border-border"
                            }`}
                          />
                          <span className="text-xs text-muted-foreground w-16">
                            {stockDisplay.display}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-foreground">
                        {product.productType === "fractional" && product.unitVolume
                          ? `${product.unitVolume}${product.measureUnit}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stockDisplay.status === "empty"
                            ? "bg-destructive/20 text-destructive"
                            : stockDisplay.status === "low"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/20 text-green-300"
                        }`}>
                          {stockDisplay.status === "empty" ? "Esgotado" : stockDisplay.status === "low" ? "Baixo" : "Alto"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenProductModal(product)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Product Type */}
            <div>
              <Label className="text-muted-foreground mb-2 block">Tipo de Produto *</Label>
              <RadioGroup
                value={productForm.productType}
                onValueChange={(v) => setProductForm({ ...productForm, productType: v as ProductType })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whole" id="whole" />
                  <Label htmlFor="whole" className="text-foreground cursor-pointer">
                    Produto Inteiro
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fractional" id="fractional" />
                  <Label htmlFor="fractional" className="text-foreground cursor-pointer">
                    Produto Fracionado
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-1">
                {productForm.productType === "whole" 
                  ? "Ex: lata de refrigerante, doce, copo descartável" 
                  : "Ex: batata congelada, cheddar, bacon, calda"}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground mb-1 block">Nome *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Nome do produto"
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <Label className="text-muted-foreground mb-1 block">Descrição</Label>
              <Input
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Descrição do produto"
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <Label className="text-muted-foreground mb-1 block">Categoria *</Label>
              <Select
                value={productForm.category}
                onValueChange={(v) => setProductForm({ ...productForm, category: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground mb-1 block">
                  Preço de Venda {productForm.productType === "whole" ? "*" : ""}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="0.00"
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground mb-1 block">Preço de Custo</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                  placeholder="0.00"
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            {/* Fractional-specific fields */}
            {productForm.productType === "fractional" && (
              <>
                <div>
                  <Label className="text-muted-foreground mb-1 block">Unidade de Medida *</Label>
                  <RadioGroup
                    value={productForm.measureUnit}
                    onValueChange={(v) => setProductForm({ ...productForm, measureUnit: v as MeasureUnit })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="g" id="grams" />
                      <Label htmlFor="grams" className="text-foreground cursor-pointer">
                        Gramas (g)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ml" id="milliliters" />
                      <Label htmlFor="milliliters" className="text-foreground cursor-pointer">
                        Mililitros (ml)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground mb-1 block">Volume da Unidade *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={productForm.unitVolume}
                        onChange={(e) => setProductForm({ ...productForm, unitVolume: e.target.value })}
                        placeholder="Ex: 2000"
                        className="bg-secondary border-border"
                      />
                      <span className="text-muted-foreground">{productForm.measureUnit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Ex: saco de 2000g</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground mb-1 block">Estoque Inicial *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={productForm.stockUnits}
                        onChange={(e) => setProductForm({ ...productForm, stockUnits: e.target.value })}
                        placeholder="Ex: 5"
                        className="bg-secondary border-border"
                      />
                      <span className="text-muted-foreground">un</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Unidades inteiras</p>
                  </div>
                </div>

                {productForm.unitVolume && productForm.stockUnits && (
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Volume Total Disponível</p>
                    <p className="text-lg font-bold text-primary">
                      {(parseFloat(productForm.unitVolume) * parseFloat(productForm.stockUnits)).toLocaleString()}{productForm.measureUnit}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="text-foreground">
                Produto Ativo
              </Label>
              <Switch
                id="active"
                checked={productForm.active}
                onCheckedChange={(checked) => setProductForm({ ...productForm, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowProductModal(false)}
              className="bg-acai-purple-deep text-white border-acai-purple-deep hover:bg-acai-purple-dark"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} className="bg-primary text-acai-purple-deep hover:bg-primary/90">
              {editingProduct ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria"
              className="bg-secondary border-border"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryModal(false)}
              className="bg-acai-purple-deep text-white border-acai-purple-deep hover:bg-acai-purple-dark"
            >
              Cancelar
            </Button>
            <Button onClick={handleAddCategory} className="bg-primary text-acai-purple-deep hover:bg-primary/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
