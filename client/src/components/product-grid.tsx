import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { ProductWithCategory } from "@shared/schema";

interface ProductGridProps {
  establishmentId: number;
  categoryId?: number;
  featured?: boolean;
}

export function ProductGrid({ establishmentId, categoryId, featured = false }: ProductGridProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const queryKey = featured 
    ? ['/api/establishments', establishmentId, 'featured-products']
    : categoryId 
    ? ['/api/categories', categoryId, 'products']
    : ['/api/establishments', establishmentId, 'products'];

  const { data: products, isLoading } = useQuery<ProductWithCategory[]>({
    queryKey,
  });

  const handleAddToCart = (product: ProductWithCategory) => {
    dispatch({ type: "ADD_ITEM", product });
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getDiscountPercentage = (price: string, originalPrice?: string) => {
    if (!originalPrice) return null;
    const discount = ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100;
    return Math.round(discount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-slate-200 rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded mb-2" />
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-2">Nenhum produto encontrado</div>
        <p className="text-slate-500">Tente buscar em outra categoria ou estabelecimento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const discountPercentage = getDiscountPercentage(product.price, product.originalPrice);
        
        return (
          <Card key={product.id} className="hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative">
              <img 
                src={product.imageUrl || `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              
              {discountPercentage && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  -{discountPercentage}%
                </Badge>
              )}
              
              {product.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-accent text-white">
                  <Star className="mr-1" size={12} />
                  Destaque
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg"
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart 
                  className={favorites.has(product.id) ? "text-red-500 fill-red-500" : "text-slate-400"}
                  size={16}
                />
              </Button>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-medium text-slate-900 mb-2">{product.name}</h3>
              <p className="text-slate-500 text-sm mb-3">{product.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {product.originalPrice && (
                    <span className="text-slate-400 text-sm line-through">
                      R$ {Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-slate-900">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                </div>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? "Em estoque" : "Indisponível"}
                </Badge>
              </div>
              
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2" size={16} />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
