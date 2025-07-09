import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, Package, Building, Plus, BarChart3, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderWithItems } from "@shared/schema";

interface AdminDashboardProps {
  establishmentId: number;
}

export function AdminDashboard({ establishmentId }: AdminDashboardProps) {
  const { data: stats } = useQuery({
    queryKey: ['/api/establishments', establishmentId, 'stats'],
  });

  const { data: orders } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/establishments', establishmentId, 'orders'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'credit_card':
        return 'Cartão';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Administrativo</h2>
      </div>

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
                <TrendingUp className="text-white" size={20} />
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
                <ShoppingBag className="text-white" size={20} />
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
                <Building className="text-white" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead>Status Pedido</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>R$ {Number(order.totalAmount).toFixed(2)}</TableCell>
                    <TableCell>{formatPaymentMethod(order.paymentMethod)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.paymentStatus)}>
                        {order.paymentStatus === 'paid' ? 'Pago' : 
                         order.paymentStatus === 'pending' ? 'Pendente' : 
                         order.paymentStatus === 'failed' ? 'Falhou' : order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getOrderStatusColor(order.orderStatus)}>
                        {order.orderStatus === 'processing' ? 'Processando' :
                         order.orderStatus === 'confirmed' ? 'Confirmado' :
                         order.orderStatus === 'preparing' ? 'Preparando' :
                         order.orderStatus === 'delivering' ? 'Entregando' :
                         order.orderStatus === 'delivered' ? 'Entregue' :
                         order.orderStatus === 'cancelled' ? 'Cancelado' : order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button className="h-16 text-left justify-start">
          <Plus className="mr-2" size={20} />
          <div>
            <p className="font-semibold">Adicionar Produto</p>
            <p className="text-sm opacity-80">Cadastrar novo produto</p>
          </div>
        </Button>

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
    </div>
  );
}
