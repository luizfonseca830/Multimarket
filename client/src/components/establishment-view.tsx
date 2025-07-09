import { useState } from "react";
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
  const { dispatch } = useCart();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/establishments', establishment.id, 'categories'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/establishments', establishment.id, 'products'],
  });

  const filteredProducts = selectedCategory 
    ? products?.filter(product => product.categoryId === selectedCategory)
    : products;

  const handleAddToCart = (product: ProductWithCategory) => {
    dispatch({ type: "ADD_ITEM", product });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft size={16} />
          Voltar
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Store className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{establishment.name}</h1>
            <p className="text-slate-600">{establishment.description}</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Categorias</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {selectedCategory 
              ? `Produtos - ${categories?.find(c => c.id === selectedCategory)?.name}`
              : "Todos os Produtos"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts?.map((product) => (
              <Card key={product.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                    <ShoppingCart className="text-slate-400" size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-900 line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus size={14} />
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
  );
}