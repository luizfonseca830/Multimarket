import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Store, ShoppingCart, Plus } from "lucide-react";
import { Establishment, ProductWithCategory, Category } from "@shared/schema";
import { useCart } from "@/lib/cart-context";

interface EstablishmentViewProps {
  establishment: Establishment;
  onBack: () => void;
}

export function EstablishmentView({ establishment, onBack }: EstablishmentViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('best_sellers');
  const { dispatch } = useCart();

  // Define o estabelecimento atual no contexto do carrinho
  useEffect(() => {
    dispatch({ type: "SET_CURRENT_ESTABLISHMENT", establishmentId: establishment.id });
  }, [establishment.id, dispatch]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/establishments', establishment.id, 'categories'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/establishments', establishment.id, 'products', sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/establishments/${establishment.id}/products?sortBy=${sortBy}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const filteredProducts = selectedCategory 
    ? products?.filter(product => product.categoryId === selectedCategory)
    : products;

  const handleAddToCart = (product: ProductWithCategory) => {
    dispatch({ 
      type: "ADD_ITEM", 
      product, 
      establishmentId: establishment.id 
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft size={16} />
          Voltar
        </Button>
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
            establishment.type === 'butcher' 
              ? 'bg-gradient-to-br from-orange-600 to-orange-700' 
              : 'bg-gradient-to-br from-amber-600 to-amber-700'
          }`}>
            {establishment.type === 'butcher' ? (
              <svg viewBox="0 0 100 100" className="w-6 h-6 fill-yellow-100">
                <path d="M50 25 C35 25, 25 35, 25 50 C25 55, 27 60, 30 64 L35 58 C33 55, 32 52, 32 50 C32 40, 40 32, 50 32 C60 32, 68 40, 68 50 C68 52, 67 55, 65 58 L70 64 C73 60, 75 55, 75 50 C75 35, 65 25, 50 25 Z M20 45 C15 40, 12 35, 15 30 C18 25, 25 27, 30 32 M80 45 C85 40, 88 35, 85 30 C82 25, 75 27, 70 32"/>
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" className="w-6 h-6 fill-black">
                <path d="M20 30 L50 15 L80 30 L50 45 Z M20 30 L20 70 L50 85 L80 70 L80 30 M35 40 L35 60 L65 60 L65 40"/>
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{establishment.name}</h1>
            <p className="text-slate-600 text-lg">{establishment.description}</p>
          </div>
        </div>
      </div>

      {/* Hero Section with Categories */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Category Showcase */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {establishment.type === 'butcher' ? 'CARNES' : establishment.name.toUpperCase()}
              </h2>
              <p className="text-slate-600 text-lg">
                {establishment.type === 'butcher' 
                  ? 'Carnes selecionadas e temperadas para você levar uma carne saborosa e molinha para casa.'
                  : 'Produtos selecionados com qualidade e tradição para sua mesa.'
                }
              </p>
            </div>

            {/* Category Highlights */}
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">CATEGORIAS EM DESTAQUE</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories?.slice(0, 5).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg p-3 text-center transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                      <Store className="text-orange-600 group-hover:scale-110 transition-transform" size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 uppercase">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Featured Product Image */}
          <div className="flex justify-center">
            <div className="w-72 h-72 bg-white rounded-full shadow-xl flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <div className="text-6xl">
                  {establishment.type === 'butcher' ? '🥩' : '🛒'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">PRODUTOS</h2>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            Todas as Categorias
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Ordering Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">ORDENAR</h2>
        
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <button 
            onClick={() => setSortBy('price_desc')}
            className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
              sortBy === 'price_desc' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-200 hover:border-orange-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              sortBy === 'price_desc' ? 'bg-orange-100' : 'bg-slate-100'
            }`}>
              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${
                sortBy === 'price_desc' ? 'text-orange-600' : 'text-slate-600'
              }`}>
                <path fill="currentColor" d="M7 14l5-5 5 5z"/>
              </svg>
            </div>
            <span className={`text-xs font-medium text-center ${
              sortBy === 'price_desc' ? 'text-orange-700' : 'text-slate-700'
            }`}>MAIOR PREÇO</span>
          </button>
          
          <button 
            onClick={() => setSortBy('price_asc')}
            className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
              sortBy === 'price_asc' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-200 hover:border-orange-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              sortBy === 'price_asc' ? 'bg-orange-100' : 'bg-slate-100'
            }`}>
              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${
                sortBy === 'price_asc' ? 'text-orange-600' : 'text-slate-600'
              }`}>
                <path fill="currentColor" d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
            <span className={`text-xs font-medium text-center ${
              sortBy === 'price_asc' ? 'text-orange-700' : 'text-slate-700'
            }`}>MENOR PREÇO</span>
          </button>
          
          <button 
            onClick={() => setSortBy('best_sellers')}
            className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
              sortBy === 'best_sellers' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-200 hover:border-orange-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              sortBy === 'best_sellers' ? 'bg-orange-100' : 'bg-slate-100'
            }`}>
              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${
                sortBy === 'best_sellers' ? 'text-orange-600' : 'text-slate-600'
              }`}>
                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className={`text-xs font-medium text-center ${
              sortBy === 'best_sellers' ? 'text-orange-700' : 'text-slate-700'
            }`}>MAIS VENDIDOS</span>
          </button>
          
          <button 
            onClick={() => setSortBy('discount')}
            className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
              sortBy === 'discount' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-200 hover:border-orange-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              sortBy === 'discount' ? 'bg-orange-100' : 'bg-slate-100'
            }`}>
              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${
                sortBy === 'discount' ? 'text-orange-600' : 'text-slate-600'
              }`}>
                <path fill="currentColor" d="M9 3v2H5v14h4v2H3V3h6zm12 0v18h-8v-2h6V5h-6V3h8z"/>
              </svg>
            </div>
            <span className={`text-xs font-medium text-center ${
              sortBy === 'discount' ? 'text-orange-700' : 'text-slate-700'
            }`}>MAIOR DESCONTO</span>
          </button>
          
          <button 
            onClick={() => setSortBy('name_asc')}
            className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
              sortBy === 'name_asc' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-200 hover:border-orange-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              sortBy === 'name_asc' ? 'bg-orange-100' : 'bg-slate-100'
            }`}>
              <span className={`text-xs font-bold ${
                sortBy === 'name_asc' ? 'text-orange-600' : 'text-slate-600'
              }`}>A-Z</span>
            </div>
            <span className={`text-xs font-medium text-center ${
              sortBy === 'name_asc' ? 'text-orange-700' : 'text-slate-700'
            }`}>DE A A Z</span>
          </button>
          
          <button 
            onClick={() => setSortBy('name_desc')}
            className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
              sortBy === 'name_desc' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-200 hover:border-orange-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              sortBy === 'name_desc' ? 'bg-orange-100' : 'bg-slate-100'
            }`}>
              <span className={`text-xs font-bold ${
                sortBy === 'name_desc' ? 'text-orange-600' : 'text-slate-600'
              }`}>Z-A</span>
            </div>
            <span className={`text-xs font-medium text-center ${
              sortBy === 'name_desc' ? 'text-orange-700' : 'text-slate-700'
            }`}>DE Z A A</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">CATEGORIAS</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === null 
                    ? 'bg-orange-100 text-orange-700 font-medium' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                TODOS ({products?.length || 0})
              </button>
              
              {categories?.map((category) => {
                const categoryProducts = products?.filter(p => p.categoryId === category.id) || [];
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-orange-100 text-orange-700 font-medium' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {category.name.toUpperCase()} ({categoryProducts.length})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedCategory 
                ? `${categories?.find(c => c.id === selectedCategory)?.name.toUpperCase()}`
                : "TODOS OS PRODUTOS"
              }
            </h2>
            <Badge variant="secondary">
              {filteredProducts?.length || 0} produtos
            </Badge>
          </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3">
                  <div className="aspect-square bg-slate-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {selectedCategory ? "Nenhum produto nesta categoria" : "Nenhum produto disponível"}
            </h3>
            <p className="text-slate-500">
              {selectedCategory 
                ? "Tente selecionar uma categoria diferente"
                : "Este estabelecimento ainda não tem produtos cadastrados"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">
                          {establishment.type === 'butcher' ? '🥩' : '🛒'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-orange-600 text-white font-bold px-3 py-1">
                      R$ {parseFloat(product.price).toFixed(2)}
                    </Badge>
                  </div>
                  
                  {/* Stock Badge */}
                  {product.stock && product.stock > 0 && product.stock <= 10 && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="destructive" className="text-xs">
                        Últimas {product.stock} unidades
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 text-lg">
                          {product.name}
                        </h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {product.category.name}
                        </Badge>
                      </div>
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">
                          {product.stock ? `${product.stock} em estoque` : 'Disponível'}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-200"
                      >
                        <Plus size={16} />
                        <span>Adicionar</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}