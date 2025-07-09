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
import { SearchResults } from "@/components/search-results";
import { Establishment, Category, Offer } from "@shared/schema";
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
  Baby,
  Store,
  MapPin,
  Clock
} from "lucide-react";

export default function Home() {
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: establishments } = useQuery<Establishment[]>({
    queryKey: ['/api/establishments'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/establishments', selectedEstablishment?.id, 'categories'],
    enabled: !!selectedEstablishment?.id,
  });

  const { data: offers } = useQuery<Offer[]>({
    queryKey: ['/api/establishments', selectedEstablishment?.id, 'offers'],
    enabled: !!selectedEstablishment?.id,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab("search");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveTab("home");
  };

  const handleEstablishmentSelect = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    setActiveTab("products");
    setSelectedCategory(null);
  };

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
        onSearch={handleSearch}
      />



      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Page - Show when no establishment is selected */}
          <TabsContent value="home" className="space-y-8 sm:space-y-12">
            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <div className="relative bg-gradient-to-r from-secondary to-emerald-600 rounded-2xl overflow-hidden h-48 sm:h-64">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="relative z-10 p-4 sm:p-8 h-full flex flex-col justify-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Bem-vindo ao Multi Store</h2>
                    <p className="text-white text-sm sm:text-lg mb-4 sm:mb-6">Escolha um estabelecimento para começar suas compras</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Entrega Rápida</h3>
                      <Truck className="text-primary" size={20} />
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm">Entrega em até 2 horas para sua região</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Pagamento Seguro</h3>
                      <Shield className="text-secondary" size={20} />
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm">PIX, cartão de crédito e débito</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Establishments Section */}
            <section>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Nossos Estabelecimentos</h2>
                <p className="text-slate-600 text-sm sm:text-base">Escolha um estabelecimento para começar suas compras</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {establishments?.map((establishment) => (
                  <Card 
                    key={establishment.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleEstablishmentSelect(establishment)}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Store className="text-white" size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{establishment.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-600">{establishment.type}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{establishment.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500">
                          <MapPin size={14} />
                          <span>Disponível na região</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500">
                          <Clock size={14} />
                          <span>Aberto</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Offers Section */}
            <section>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Ofertas Especiais</h2>
                <p className="text-slate-600 text-sm sm:text-base">Produtos com descontos especiais em todos os estabelecimentos</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Até 50% OFF</h3>
                    <p className="text-xs sm:text-sm opacity-90">Em produtos selecionados</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Frete Grátis</h3>
                    <p className="text-xs sm:text-sm opacity-90">Em compras acima de R$ 50</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Cashback</h3>
                    <p className="text-xs sm:text-sm opacity-90">5% de volta em toda compra</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          {/* Search Results */}
          <TabsContent value="search">
            {selectedEstablishment && searchQuery && (
              <SearchResults 
                establishmentId={selectedEstablishment.id}
                query={searchQuery}
                onClearSearch={clearSearch}
              />
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-12">

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

          {/* Dynamic Category Tabs */}
          {categories?.map((category) => (
            <TabsContent key={category.id} value={`category-${category.id}`}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{category.name}</h2>
                <p className="text-slate-600">Produtos da categoria {category.name}</p>
              </div>
              {selectedEstablishment && (
                <ProductGrid 
                  establishmentId={selectedEstablishment.id}
                  categoryId={category.id}
                />
              )}
            </TabsContent>
          ))}

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
