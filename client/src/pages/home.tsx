import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { ProductGrid } from "@/components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Establishment, Category } from "@shared/schema";
import { 
  Truck, 
  Shield, 
  ShoppingCart, 
  Coffee, 
  UtensilsCrossed, 
  Carrot,
  Beef,
  Pizza,
  Croissant,
  SprayCan,
  Baby
} from "lucide-react";

export default function Home() {
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [activeTab, setActiveTab] = useState("products");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/establishments', selectedEstablishment?.id, 'categories'],
    enabled: !!selectedEstablishment?.id,
  });

  const getCategoryIcon = (name: string) => {
    const iconName = name.toLowerCase();
    if (iconName.includes('carne')) return <Beef className="text-red-600" size={20} />;
    if (iconName.includes('fruta') || iconName.includes('verdura')) return <Carrot className="text-green-600" size={20} />;
    if (iconName.includes('latic')) return <Pizza className="text-blue-600" size={20} />;
    if (iconName.includes('padaria') || iconName.includes('pão')) return <Croissant className="text-yellow-600" size={20} />;
    if (iconName.includes('limpeza')) return <SprayCan className="text-purple-600" size={20} />;
    if (iconName.includes('bebê')) return <Baby className="text-pink-600" size={20} />;
    return <ShoppingCart className="text-slate-600" size={20} />;
  };

  const getCategoryColor = (name: string) => {
    const iconName = name.toLowerCase();
    if (iconName.includes('carne')) return 'bg-red-100';
    if (iconName.includes('fruta') || iconName.includes('verdura')) return 'bg-green-100';
    if (iconName.includes('latic')) return 'bg-blue-100';
    if (iconName.includes('padaria') || iconName.includes('pão')) return 'bg-yellow-100';
    if (iconName.includes('limpeza')) return 'bg-purple-100';
    if (iconName.includes('bebê')) return 'bg-pink-100';
    return 'bg-slate-100';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        selectedEstablishment={selectedEstablishment}
        onEstablishmentChange={setSelectedEstablishment}
      />

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between h-12">
              <TabsList className="h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="products" 
                  className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                >
                  Todos os Produtos
                </TabsTrigger>
                <TabsTrigger 
                  value="offers" 
                  className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                >
                  Ofertas
                </TabsTrigger>
                <TabsTrigger 
                  value="categories" 
                  className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                >
                  Categorias
                </TabsTrigger>
                <TabsTrigger 
                  value="featured" 
                  className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                >
                  Novidades
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab("admin")}
                  className="text-slate-600 hover:text-primary"
                >
                  <UtensilsCrossed className="mr-1" size={16} />
                  Admin
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="products" className="space-y-12">
            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative bg-gradient-to-r from-secondary to-emerald-600 rounded-2xl overflow-hidden h-64">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ofertas Especiais</h2>
                    <p className="text-white text-lg mb-6">Até 50% de desconto em produtos selecionados</p>
                    <Button 
                      className="bg-white text-secondary hover:bg-slate-50 w-fit"
                      onClick={() => setActiveTab("offers")}
                    >
                      Ver Ofertas
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Entrega Rápida</h3>
                      <Truck className="text-primary" size={24} />
                    </div>
                    <p className="text-slate-600 text-sm">Entrega em até 2 horas para sua região</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Pagamento Seguro</h3>
                      <Shield className="text-secondary" size={24} />
                    </div>
                    <p className="text-slate-600 text-sm">PIX, cartão de crédito e débito</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Categories Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Categorias</h2>
                <Button variant="ghost" onClick={() => setActiveTab("categories")}>
                  Ver todas
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories?.slice(0, 6).map((category) => (
                  <Card 
                    key={category.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab("categories");
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${getCategoryColor(category.name)} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm">{category.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Featured Products */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Produtos em Destaque</h2>
              </div>
              {selectedEstablishment && (
                <ProductGrid 
                  establishmentId={selectedEstablishment.id} 
                  featured={true}
                />
              )}
            </section>
          </TabsContent>

          <TabsContent value="offers">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Ofertas Especiais</h2>
              <p className="text-slate-600">Produtos com desconto especial por tempo limitado</p>
            </div>
            {selectedEstablishment && (
              <ProductGrid establishmentId={selectedEstablishment.id} />
            )}
          </TabsContent>

          <TabsContent value="categories">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Categorias</h2>
              <p className="text-slate-600">Explore produtos por categoria</p>
            </div>
            
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  Todas
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {selectedEstablishment && (
              <ProductGrid 
                establishmentId={selectedEstablishment.id}
                categoryId={selectedCategory || undefined}
              />
            )}
          </TabsContent>

          <TabsContent value="featured">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Produtos em Destaque</h2>
              <p className="text-slate-600">Nossos produtos mais populares e lançamentos</p>
            </div>
            {selectedEstablishment && (
              <ProductGrid 
                establishmentId={selectedEstablishment.id} 
                featured={true}
              />
            )}
          </TabsContent>

          <TabsContent value="admin">
            {selectedEstablishment && (
              <AdminDashboard establishmentId={selectedEstablishment.id} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <CartSidebar />

      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-white" size={20} />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold">Multi Store</h3>
                  <p className="text-slate-400 text-sm">Rede de Estabelecimentos</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Sua rede de confiança para compras online com entrega rápida e produtos frescos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Estabelecimentos</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Supermercado Central</li>
                <li>Açougue Premium</li>
                <li>Padaria Artesanal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Atendimento</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Central de Ajuda</li>
                <li>Fale Conosco</li>
                <li>Política de Privacidade</li>
                <li>Termos de Uso</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>📞 (11) 9999-9999</li>
                <li>✉️ contato@multistore.com</li>
                <li>📍 São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 Multi Store. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
