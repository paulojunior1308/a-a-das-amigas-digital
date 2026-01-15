import { useState, useMemo } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Filter, 
  DollarSign,
  ShoppingCart,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useSales } from "@/contexts/SalesContext";
import { useProducts } from "@/contexts/ProductsContext";

export default function AdminReports() {
  const { sales, getSalesByPeriod } = useSales();
  const { categories } = useProducts();

  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterType, setFilterType] = useState<"all" | "pdv" | "comanda">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredSales = useMemo(() => {
    const start = startOfDay(new Date(dateFrom));
    const end = endOfDay(new Date(dateTo));
    
    let result = getSalesByPeriod(start, end);
    
    if (filterType !== "all") {
      result = result.filter((sale) => sale.type === filterType);
    }
    
    return result;
  }, [dateFrom, dateTo, filterType, getSalesByPeriod]);

  const totals = useMemo(() => {
    const pdvTotal = filteredSales
      .filter((s) => s.type === "pdv")
      .reduce((acc, s) => acc + s.total, 0);
    const comandaTotal = filteredSales
      .filter((s) => s.type === "comanda")
      .reduce((acc, s) => acc + s.total, 0);
    const total = pdvTotal + comandaTotal;
    
    return { pdvTotal, comandaTotal, total };
  }, [filteredSales]);

  const paymentMethodLabels: Record<string, string> = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    cartao_debito: "Débito",
    cartao_credito: "Crédito",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Relatórios</h1>
        <p className="text-acai-lilac">Análise de vendas e desempenho</p>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data Início</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data Fim</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo de Venda</label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pdv">PDV Direto</SelectItem>
                  <SelectItem value="comanda">Comandas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Geral</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {totals.total.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-acai-green/20">
                <ShoppingCart className="w-6 h-6 text-acai-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas PDV</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {totals.pdvTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas Comanda</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {totals.comandaTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-foreground">Data/Hora</TableHead>
                  <TableHead className="text-foreground">Tipo</TableHead>
                  <TableHead className="text-foreground">Comanda</TableHead>
                  <TableHead className="text-foreground">Pagamento</TableHead>
                  <TableHead className="text-foreground text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="border-border">
                      <TableCell className="text-foreground">
                        {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.type === "pdv"
                              ? "bg-acai-green/20 text-acai-green"
                              : "bg-accent/20 text-accent"
                          }`}
                        >
                          {sale.type === "pdv" ? "PDV" : "Comanda"}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {sale.comandaNumber ? `#${sale.comandaNumber}` : "-"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {paymentMethodLabels[sale.paymentMethod]}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        R$ {sale.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma venda encontrada no período selecionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
