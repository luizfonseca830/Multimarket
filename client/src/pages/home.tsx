import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { GlobalSearch } from "@/components/global-search";
import { EstablishmentView } from "@/components/establishment-view";
import { CartSidebar } from "@/components/cart-sidebar";
import { useCart } from "@/lib/cart-context";
import { Store, ShoppingCart, Star } from "lucide-react";
import { Establishment, Category, ProductWithCategory } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const { state: cartState, dispatch } = useCart();

  const { data: establishments, isLoading: establishmentsLoading } = useQuery<Establishment[]>({
    queryKey: ['/api/establishments'],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEstablishmentSelect = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    setSearchQuery("");
  };

  const handleProductSelect = (product: ProductWithCategory) => {
    // Adicionar produto ao carrinho
    dispatch({ type: "ADD_ITEM", product });
  };

  const handleCategorySelect = (category: Category) => {
    // Buscar produtos dessa categoria
    setSearchQuery(category.name);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleBackToHome = () => {
    setSelectedEstablishment(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        selectedEstablishment={selectedEstablishment}
        onEstablishmentChange={handleEstablishmentSelect}
        onSearch={handleSearch}
        onHome={handleBackToHome}
      />
      
      <div className="container mx-auto px-4 py-6">
        {selectedEstablishment ? (
          <EstablishmentView
            establishment={selectedEstablishment}
            onBack={handleBackToHome}
          />
        ) : searchQuery ? (
          <GlobalSearch
            query={searchQuery}
            onClearSearch={handleClearSearch}
            onEstablishmentSelect={handleEstablishmentSelect}
            onProductSelect={handleProductSelect}
            onCategorySelect={handleCategorySelect}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Bem-vindo ao Multi Store
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Explore nossos estabelecimentos e encontre os melhores produtos
              </p>
            </div>

            {/* Establishments Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Nossos Estabelecimentos</h2>
                <Badge variant="secondary" className="hidden sm:flex">
                  {establishments?.length || 0} estabelecimentos
                </Badge>
              </div>

              {establishmentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {establishments?.map((establishment) => (
                    <Card 
                      key={establishment.id} 
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => handleEstablishmentSelect(establishment)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                            <Store className="text-white" size={24} />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {establishment.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {establishment.type}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {establishment.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Featured Section */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-500" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Destaques</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <ShoppingCart className="text-white" size={24} />
                      <h3 className="text-lg font-semibold">Entrega Rápida</h3>
                    </div>
                    <p className="text-white/90">
                      Receba seus produtos em casa rapidamente
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Store className="text-white" size={24} />
                      <h3 className="text-lg font-semibold">Múltiplas Lojas</h3>
                    </div>
                    <p className="text-white/90">
                      Diferentes tipos de estabelecimentos
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Star className="text-white" size={24} />
                      <h3 className="text-lg font-semibold">Produtos Frescos</h3>
                    </div>
                    <p className="text-white/90">
                      Qualidade garantida em todos os produtos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}
      </div>
      
      <CartSidebar />
    </div>
  );
}
