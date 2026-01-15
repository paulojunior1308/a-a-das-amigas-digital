import { useState } from "react";
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  Search,
  X
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts } from "@/contexts/ProductsContext";
import { useStock } from "@/contexts/StockContext";
import { Product } from "@/types/menu";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
}

export default function AdminStock() {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useProducts();
  const { stock, updateStock, setMinQuantity, getStockForProduct } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", category: categories[0]?.id || "" });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
      });
      toast.success("Produto atualizado com sucesso!");
    } else {
      addProduct({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
      });
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

  const handleStockChange = (productId: string, value: string) => {
    const qty = parseInt(value) || 0;
    updateStock(productId, qty);
  };

  const handleMinQtyChange = (productId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setMinQuantity(productId, qty);
  };

  const getStockStatus = (productId: string) => {
    const stockItem = stock.find((s) => s.productId === productId);
    if (!stockItem) return "normal";
    if (stockItem.quantity === 0) return "empty";
    if (stockItem.quantity <= stockItem.minQuantity) return "low";
    return "normal";
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
                  <TableHead className="text-foreground">Categoria</TableHead>
                  <TableHead className="text-foreground text-right">Preço</TableHead>
                  <TableHead className="text-foreground text-center">Estoque</TableHead>
                  <TableHead className="text-foreground text-center">Mínimo</TableHead>
                  <TableHead className="text-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockItem = stock.find((s) => s.productId === product.id);
                  const status = getStockStatus(product.id);
                  const category = categories.find((c) => c.id === product.category);

                  return (
                    <TableRow key={product.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {status === "low" && (
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
                      <TableCell className="text-foreground">
                        {category?.name || product.category}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        R$ {product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={stockItem?.quantity || 0}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className={`w-20 mx-auto text-center ${
                            status === "low"
                              ? "border-destructive bg-destructive/10"
                              : status === "empty"
                              ? "border-destructive bg-destructive/20"
                              : "bg-secondary border-border"
                          }`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={stockItem?.minQuantity || 0}
                          onChange={(e) => handleMinQtyChange(product.id, e.target.value)}
                          className="w-20 mx-auto text-center bg-secondary border-border"
                        />
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
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nome *</label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Nome do produto"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
              <Input
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Descrição do produto"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Preço *</label>
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
              <label className="text-sm text-muted-foreground mb-1 block">Categoria *</label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} className="bg-primary text-primary-foreground">
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
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory} className="bg-primary text-primary-foreground">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
