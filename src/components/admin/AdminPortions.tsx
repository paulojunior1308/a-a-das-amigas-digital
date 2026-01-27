import { useState } from "react";
import { 
  UtensilsCrossed, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { usePortions } from "@/contexts/PortionsContext";
import { useStock } from "@/contexts/StockContext";
import { Portion, PortionIngredient } from "@/types/admin";
import { toast } from "sonner";

interface PortionFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  active: boolean;
  ingredients: PortionIngredient[];
}

const defaultFormData: PortionFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  active: true,
  ingredients: [],
};

export default function AdminPortions() {
  const { categories, getFractionalProducts } = useProducts();
  const { portions, addPortion, updatePortion, deletePortion } = usePortions();
  const { getTotalVolume } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPortion, setEditingPortion] = useState<Portion | null>(null);
  const [formData, setFormData] = useState<PortionFormData>(defaultFormData);

  const fractionalProducts = getFractionalProducts();

  const filteredPortions = portions.filter((portion) => {
    const matchesSearch = portion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || portion.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (portion?: Portion) => {
    if (portion) {
      setEditingPortion(portion);
      setFormData({
        name: portion.name,
        description: portion.description,
        price: portion.price.toString(),
        category: portion.category,
        active: portion.active,
        ingredients: [...portion.ingredients],
      });
    } else {
      setEditingPortion(null);
      setFormData({ ...defaultFormData, category: categories[0]?.id || "" });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.ingredients.length === 0) {
      toast.error("Adicione pelo menos um ingrediente");
      return;
    }

    const portionData: Omit<Portion, "id"> = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      active: formData.active,
      ingredients: formData.ingredients,
    };

    if (editingPortion) {
      updatePortion(editingPortion.id, portionData);
      toast.success("Porção atualizada com sucesso!");
    } else {
      addPortion(portionData);
      toast.success("Porção adicionada com sucesso!");
    }

    setShowModal(false);
  };

  const handleDelete = (portion: Portion) => {
    if (confirm(`Deseja realmente excluir "${portion.name}"?`)) {
      deletePortion(portion.id);
      toast.success("Porção excluída com sucesso!");
    }
  };

  const handleAddIngredient = (productId: string) => {
    const product = fractionalProducts.find((p) => p.id === productId);
    if (!product) return;

    // Check if already added
    if (formData.ingredients.some((i) => i.productId === productId)) {
      toast.error("Ingrediente já adicionado");
      return;
    }

    const newIngredient: PortionIngredient = {
      productId: product.id,
      productName: product.name,
      consumeAmount: 0,
      unit: product.measureUnit || "g",
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient],
    });
  };

  const handleUpdateIngredientAmount = (productId: string, amount: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.map((i) =>
        i.productId === productId ? { ...i, consumeAmount: amount } : i
      ),
    });
  };

  const handleRemoveIngredient = (productId: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((i) => i.productId !== productId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Porções / Doses</h1>
          <p className="text-acai-lilac">Gerencie porções que consomem produtos fracionados</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Porção
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar porção..."
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

      {/* Portions Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UtensilsCrossed className="w-5 h-5" />
            Porções ({filteredPortions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-foreground">Nome</TableHead>
                  <TableHead className="text-foreground">Categoria</TableHead>
                  <TableHead className="text-foreground text-right">Preço</TableHead>
                  <TableHead className="text-foreground">Composição</TableHead>
                  <TableHead className="text-foreground text-center">Status</TableHead>
                  <TableHead className="text-foreground text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPortions.map((portion) => {
                  const category = categories.find((c) => c.id === portion.category);

                  return (
                    <TableRow key={portion.id} className="border-border">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{portion.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {portion.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {category?.name || portion.category}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        R$ {portion.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {portion.ingredients.map((ing) => (
                            <span
                              key={ing.productId}
                              className="text-xs bg-secondary px-2 py-0.5 rounded"
                            >
                              {ing.productName}: {ing.consumeAmount}{ing.unit}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          portion.active
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}>
                          {portion.active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(portion)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(portion)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredPortions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma porção cadastrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Portion Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingPortion ? "Editar Porção" : "Nova Porção"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground mb-1 block">Nome da Porção *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Batata P, Batata c/ Cheddar"
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <Label className="text-muted-foreground mb-1 block">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da porção"
                className="bg-secondary border-border"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground mb-1 block">Preço de Venda *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-muted-foreground mb-1 block">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecione" />
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

            {/* Ingredients Section */}
            <div>
              <Label className="text-muted-foreground mb-2 block">
                Produtos que compõem esta porção *
              </Label>
              
              <div className="space-y-2 mb-3">
                {formData.ingredients.map((ingredient) => {
                  const stockAvailable = getTotalVolume(ingredient.productId);
                  return (
                    <div
                      key={ingredient.productId}
                      className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {ingredient.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Disponível: {stockAvailable.toLocaleString()}{ingredient.unit}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={ingredient.consumeAmount}
                        onChange={(e) =>
                          handleUpdateIngredientAmount(
                            ingredient.productId,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 bg-secondary border-border text-center"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {ingredient.unit}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIngredient(ingredient.productId)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {fractionalProducts.length > 0 && (
                <Select onValueChange={handleAddIngredient}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Adicionar ingrediente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fractionalProducts
                      .filter((p) => !formData.ingredients.some((i) => i.productId === p.id))
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.measureUnit})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              {fractionalProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto fracionado cadastrado. Cadastre primeiro no Estoque.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="portion-active" className="text-foreground">
                Porção Ativa
              </Label>
              <Switch
                id="portion-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              {editingPortion ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
