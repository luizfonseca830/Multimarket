import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Store, ShoppingCart, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Establishment, ProductWithCategory, Category } from "@shared/schema";

interface GlobalSearchProps {
  query: string;
  onClearSearch: () => void;
  onEstablishmentSelect: (establishment: Establishment) => void;
  onProductSelect: (product: ProductWithCategory) => void;
  onCategorySelect: (category: Category) => void;
}

export function GlobalSearch({ 
  query, 
  onClearSearch, 
  onEstablishmentSelect,
  onProductSelect,
  onCategorySelect 
}: GlobalSearchProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'establishments' | 'products' | 'categories'>('all');

  // Buscar estabelecimentos
  const { data: establishments } = useQuery<Establishment[]>({
    queryKey: ['/api/establishments'],
  });

  // Buscar produtos de todos os estabelecimentos
  const { data: allProducts } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products/search', query],
    enabled: !!query,
  });

  // Buscar categorias de todos os estabelecimentos
  const { data: allCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories/search', query],
    enabled: !!query,
  });

  // Filtrar resultados baseados na busca
  const filteredEstablishments = establishments?.filter(est => 
    est.name.toLowerCase().includes(query.toLowerCase()) ||
    est.description.toLowerCase().includes(query.toLowerCase()) ||
    est.type.toLowerCase().includes(query.toLowerCase())
  ) || [];

  const filteredProducts = allProducts?.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase()) ||
    product.category.name.toLowerCase().includes(query.toLowerCase())
  ) || [];

  const filteredCategories = allCategories?.filter(category => 
    category.name.toLowerCase().includes(query.toLowerCase())
  ) || [];

  const hasResults = filteredEstablishments.length > 0 || filteredProducts.length > 0 || filteredCategories.length > 0;

  if (!query) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto text-slate-400 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Busca Global</h2>
        <p className="text-slate-500">Digite algo para buscar estabelecimentos, produtos ou categorias</p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto text-slate-400 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum resultado encontrado</h2>
        <p className="text-slate-500 mb-4">Não encontramos nada para "{query}"</p>
        <Button onClick={onClearSearch} variant="outline">
          Limpar busca
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Resultados para "{query}"
        </h2>
        <Button onClick={onClearSearch} variant="outline" size="sm">
          Limpar busca
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          Todos ({filteredEstablishments.length + filteredProducts.length + filteredCategories.length})
        </Button>
        {filteredEstablishments.length > 0 && (
          <Button
            variant={activeTab === 'establishments' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('establishments')}
          >
            Estabelecimentos ({filteredEstablishments.length})
          </Button>
        )}
        {filteredProducts.length > 0 && (
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('products')}
          >
            Produtos ({filteredProducts.length})
          </Button>
        )}
        {filteredCategories.length > 0 && (
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('categories')}
          >
            Categorias ({filteredCategories.length})
          </Button>
        )}
      </div>

      {/* Resultados */}
      <div className="space-y-6">
        {/* Estabelecimentos */}
        {(activeTab === 'all' || activeTab === 'establishments') && filteredEstablishments.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Estabelecimentos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEstablishments.map((establishment) => (
                <Card 
                  key={establishment.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onEstablishmentSelect(establishment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Store className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{establishment.name}</h4>
                        <p className="text-sm text-slate-500">{establishment.type}</p>
                      </div>
                      <ArrowRight className="text-slate-400" size={16} />
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{establishment.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Produtos */}
        {(activeTab === 'all' || activeTab === 'products') && filteredProducts.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Produtos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onProductSelect(product)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-3">
                      <img 
                        src={product.imageUrl || `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200`}
                        alt={product.name}
                        className="w-full h-24 sm:h-32 object-cover rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category.name}
                      </Badge>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">R$ {parseFloat(product.price).toFixed(2)}</span>
                        <ArrowRight className="text-slate-400" size={14} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Categorias */}
        {(activeTab === 'all' || activeTab === 'categories') && filteredCategories.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Categorias</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCategorySelect(category)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Tag className="text-slate-600" size={20} />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{category.name}</h4>
                    <ArrowRight className="text-slate-400 mx-auto mt-2" size={14} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}