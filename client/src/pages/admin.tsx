import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Package, Percent, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Establishment, ProductWithCategory, Category } from "@shared/schema";

export default function Admin() {
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: establishments } = useQuery<Establishment[]>({
    queryKey: ['/api/establishments'],
  });

  const { data: products } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/establishments', selectedEstablishment?.id, 'products'],
    enabled: !!selectedEstablishment,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/establishments', selectedEstablishment?.id, 'categories'],
    enabled: !!selectedEstablishment,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/establishments', selectedEstablishment?.id, 'stats'],
    enabled: !!selectedEstablishment,
  });

  // Set default establishment
  if (!selectedEstablishment && establishments && establishments.length > 0) {
    setSelectedEstablishment(establishments[0]);
  }

  const AddProductForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      unit: "kg",
      stock: "",
      categoryId: "",
      isFeatured: false,
    });

    const createProductMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/products", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/establishments'] });
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
        setIsAddProductOpen(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          originalPrice: "",
          unit: "kg",
          stock: "",
          categoryId: "",
          isFeatured: false,
        });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Erro ao criar produto.",
          variant: "destructive",
        });
      },
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedEstablishment) return;

      createProductMutation.mutate({
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        establishmentId: selectedEstablishment.id,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="originalPrice">Preço Original</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="stock">Estoque</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unit">Unidade</Label>
            <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="unidade">Unidade</SelectItem>
                <SelectItem value="litro">Litro</SelectItem>
                <SelectItem value="pacote">Pacote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
            <Label htmlFor="isFeatured">Produto em destaque</Label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={createProductMutation.isPending}>
          {createProductMutation.isPending ? "Criando..." : "Criar Produto"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
            <Select value={selectedEstablishment?.id.toString()} onValueChange={(value) => {
              const establishment = establishments?.find(e => e.id === parseInt(value));
              if (establishment) setSelectedEstablishment(establishment);
            }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um estabelecimento" />
              </SelectTrigger>
              <SelectContent>
                {establishments?.map((establishment) => (
                  <SelectItem key={establishment.id} value={establishment.id.toString()}>
                    {establishment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedEstablishment && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Vendas Hoje</p>
                      <p className="text-2xl font-bold text-slate-900">
                        R$ {stats?.todaysSales?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-white" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Pedidos Hoje</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.todaysOrders || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-secondary to-emerald-600 rounded-lg flex items-center justify-center">
                      <Package className="text-white" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Produtos</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.totalProducts || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-accent to-yellow-600 rounded-lg flex items-center justify-center">
                      <Package className="text-white" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Estabelecimentos</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.totalEstablishments || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Package className="text-white" size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="h-16 text-left justify-start">
                    <Plus className="mr-2" size={20} />
                    <div>
                      <p className="font-semibold">Adicionar Produto</p>
                      <p className="text-sm opacity-80">Cadastrar novo produto</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  </DialogHeader>
                  <AddProductForm />
                </DialogContent>
              </Dialog>

              <Button className="h-16 text-left justify-start" variant="outline">
                <Percent className="mr-2" size={20} />
                <div>
                  <p className="font-semibold">Criar Oferta</p>
                  <p className="text-sm opacity-80">Configurar promoções</p>
                </div>
              </Button>

              <Button className="h-16 text-left justify-start" variant="outline">
                <BarChart3 className="mr-2" size={20} />
                <div>
                  <p className="font-semibold">Relatórios</p>
                  <p className="text-sm opacity-80">Visualizar dados</p>
                </div>
              </Button>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>R$ {Number(product.price).toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "destructive"}>
                            {product.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
