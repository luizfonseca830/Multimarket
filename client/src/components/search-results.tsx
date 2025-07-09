import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "./product-grid";
import { ProductWithCategory } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  establishmentId: number;
  query: string;
  onClearSearch: () => void;
}

export function SearchResults({ establishmentId, query, onClearSearch }: SearchResultsProps) {
  const { data: searchResults, isLoading, error } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/establishments', establishmentId, 'products', 'search', query],
    queryFn: async () => {
      const response = await fetch(`/api/establishments/${establishmentId}/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search products');
      return response.json();
    },
    enabled: !!establishmentId && !!query,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Erro ao buscar produtos. Tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Search className="text-primary" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Resultados para "{query}"
            </h2>
            <p className="text-slate-600">
              {searchResults?.length || 0} produtos encontrados
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={onClearSearch} className="flex items-center space-x-2">
          <X size={16} />
          <span>Limpar busca</span>
        </Button>
      </div>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-slate-600">
              Tente buscar com termos diferentes ou verifique a ortografia.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-slate-400">Sem imagem</div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-500 line-through">
                  R$ {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">/{product.unit}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {product.category.name}
            </span>
            <span className="text-xs text-slate-500">
              Estoque: {product.stock}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}