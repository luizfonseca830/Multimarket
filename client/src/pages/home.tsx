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
            <div className="text-center space-y-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-orange-800">
                Bem-vindo ao CARNES ANGELIN
              </h1>
              <p className="text-lg text-orange-700 max-w-2xl mx-auto">
                Açougue Premium - Carnes selecionadas e produtos de qualidade
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
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center group-hover:from-orange-700 group-hover:to-orange-800 transition-all duration-200 shadow-lg">
                            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-yellow-100">
                              <path d="M50 25 C35 25, 25 35, 25 50 C25 55, 27 60, 30 64 L35 58 C33 55, 32 52, 32 50 C32 40, 40 32, 50 32 C60 32, 68 40, 68 50 C68 52, 67 55, 65 58 L70 64 C73 60, 75 55, 75 50 C75 35, 65 25, 50 25 Z M20 45 C15 40, 12 35, 15 30 C18 25, 25 27, 30 32 M80 45 C85 40, 88 35, 85 30 C82 25, 75 27, 70 32"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-orange-700 transition-colors">
                              {establishment.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1 text-xs bg-orange-100 text-orange-800">
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
                <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <ShoppingCart className="text-white" size={24} />
                      <h3 className="text-lg font-semibold">Entrega Rápida</h3>
                    </div>
                    <p className="text-white/90">
                      Receba suas carnes frescas em casa rapidamente
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <svg viewBox="0 0 100 100" className="w-6 h-6 fill-white">
                        <path d="M50 25 C35 25, 25 35, 25 50 C25 55, 27 60, 30 64 L35 58 C33 55, 32 52, 32 50 C32 40, 40 32, 50 32 C60 32, 68 40, 68 50 C68 52, 67 55, 65 58 L70 64 C73 60, 75 55, 75 50 C75 35, 65 25, 50 25 Z M20 45 C15 40, 12 35, 15 30 C18 25, 25 27, 30 32 M80 45 C85 40, 88 35, 85 30 C82 25, 75 27, 70 32"/>
                      </svg>
                      <h3 className="text-lg font-semibold">Carnes Premium</h3>
                    </div>
                    <p className="text-white/90">
                      Seleção especial de carnes de alta qualidade
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
