import React, { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCompositeProducts } from "@/contexts/CompositeProductsContext";
import { useProducts } from "@/contexts/ProductsContext";
import { CompositeProduct, CompositeIngredient, CompositeProductType, IngredientRequirement } from "@/types/compositeProduct";
import { toast } from "sonner";

interface AdminCompositeProductsProps {
  type: CompositeProductType;
  title: string;
  description: string;
}

export default function AdminCompositeProducts({ type, title, description }: AdminCompositeProductsProps) {
  const { compositeProducts, addCompositeProduct, updateCompositeProduct, deleteCompositeProduct, getByType } = useCompositeProducts();
  const { products } = useProducts();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CompositeProduct | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCostPrice, setFormCostPrice] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formIngredients, setFormIngredients] = useState<CompositeIngredient[]>([]);

  const typeProducts = getByType(type);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCostPrice("");
    setFormActive(true);
    setFormIngredients([]);
    setEditingProduct(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: CompositeProduct) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormPrice(product.price.toString());
    setFormCostPrice(product.costPrice?.toString() || "");
    setFormActive(product.active);
    setFormIngredients([...product.ingredients]);
    setIsDialogOpen(true);
  };

  const handleAddIngredient = () => {
    const newIngredient: CompositeIngredient = {
      productId: "",
      productName: "",
      quantity: 1,
      measureUnit: "g",
      requirement: "removable",
      isDefault: true,
    };
    setFormIngredients([...formIngredients, newIngredient]);
  };

  const handleUpdateIngredient = (index: number, field: keyof CompositeIngredient, value: any) => {
    const updated = [...formIngredients];
    if (field === "productId") {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updated[index] = {
          ...updated[index],
          productId: value,
          productName: selectedProduct.name,
          measureUnit: selectedProduct.measureUnit || "un",
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFormIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formPrice || parseFloat(formPrice) <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    const productData = {
      name: formName.trim(),
      description: formDescription.trim(),
      price: parseFloat(formPrice),
      costPrice: formCostPrice ? parseFloat(formCostPrice) : undefined,
      type,
      active: formActive,
      needsPreparation: true,
      ingredients: formIngredients.filter(i => i.productId),
    };

    if (editingProduct) {
      updateCompositeProduct(editingProduct.id, productData);
      toast.success(`${title.slice(0, -1)} atualizado com sucesso!`);
    } else {
      addCompositeProduct(productData);
      toast.success(`${title.slice(0, -1)} criado com sucesso!`);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteCompositeProduct(id);
    toast.success(`${title.slice(0, -1)} removido com sucesso!`);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getRequirementBadge = (req: IngredientRequirement) => {
    switch (req) {
      case "required":
        return <Badge variant="destructive" className="text-xs">Obrigatório</Badge>;
      case "optional":
        return <Badge variant="secondary" className="text-xs">Opcional</Badge>;
      case "removable":
        return <Badge variant="outline" className="text-xs">Removível</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openNewDialog} className="bg-acai-green hover:bg-acai-green-light text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo {title.slice(0, -1)}
        </Button>
      </div>

      {/* Products List */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        {typeProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum {title.toLowerCase().slice(0, -1)} cadastrado</p>
            <Button onClick={openNewDialog} variant="link" className="mt-2 text-primary">
              Criar primeiro {title.toLowerCase().slice(0, -1)}
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible value={expandedProduct || ""} onValueChange={setExpandedProduct}>
            {typeProducts.map((product) => (
              <AccordionItem key={product.id} value={product.id} className="border-b border-border last:border-0">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                  <AccordionTrigger className="flex-1 hover:no-underline py-0">
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-card-foreground">{product.name}</span>
                          {!product.active && (
                            <Badge variant="secondary" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                        <p className="text-xs text-muted-foreground">{product.ingredients.length} ingredientes</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(product);
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="px-4 pb-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-card-foreground mb-3">Ingredientes:</h4>
                    <div className="space-y-2">
                      {product.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-card-foreground">{ing.productName}</span>
                            {getRequirementBadge(ing.requirement)}
                          </div>
                          <span className="text-muted-foreground">
                            {ing.quantity}{ing.measureUnit}
                          </span>
                        </div>
                      ))}
                    </div>
                    {product.costPrice && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Custo: {formatPrice(product.costPrice)} | 
                          Margem: {(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {editingProduct ? `Editar ${title.slice(0, -1)}` : `Novo ${title.slice(0, -1)}`}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preencha as informações e adicione os ingredientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço de Venda *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição do produto"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="active">Produto Ativo</Label>
                <Switch
                  id="active"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-card-foreground">Ingredientes</Label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddIngredient}
                  className="bg-acai-green hover:bg-acai-green-light text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {formIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum ingrediente adicionado
                </p>
              ) : (
                <div className="space-y-3">
                  {formIngredients.map((ing, index) => (
                    <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Select
                            value={ing.productId}
                            onValueChange={(v) => handleUpdateIngredient(index, "productId", v)}
                          >
                            <SelectTrigger className="col-span-2 bg-card text-card-foreground border-border">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            step="0.1"
                            value={ing.quantity}
                            onChange={(e) => handleUpdateIngredient(index, "quantity", parseFloat(e.target.value) || 0)}
                            placeholder="Qtd"
                          />

                          <Select
                            value={ing.measureUnit}
                            onValueChange={(v) => handleUpdateIngredient(index, "measureUnit", v)}
                          >
                            <SelectTrigger className="bg-card text-card-foreground border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">gramas</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="un">unidade</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Select
                          value={ing.requirement}
                          onValueChange={(v) => handleUpdateIngredient(index, "requirement", v as IngredientRequirement)}
                        >
                          <SelectTrigger className="w-[140px] bg-card text-card-foreground border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Obrigatório</SelectItem>
                            <SelectItem value="optional">Opcional</SelectItem>
                            <SelectItem value="removable">Removível</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`default-${index}`}
                            checked={ing.isDefault}
                            onCheckedChange={(v) => handleUpdateIngredient(index, "isDefault", v)}
                          />
                          <Label htmlFor={`default-${index}`} className="text-sm cursor-pointer">
                            Incluir por padrão
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="bg-acai-purple-deep text-white border-acai-purple-deep hover:bg-acai-purple-dark"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary text-acai-purple-deep">
              {editingProduct ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
