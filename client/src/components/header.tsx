import { Search, ShoppingCart, User, Store, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HeaderProps {
  selectedEstablishment: any;
  onEstablishmentChange: (establishment: any) => void;
  onSearch?: (query: string) => void;
  onHome?: () => void;
}

export function Header({ selectedEstablishment, onEstablishmentChange, onSearch, onHome }: HeaderProps) {
  const { state: cartState, dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Mobile Header */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between h-14">
            {/* Logo Mobile */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center border-2 border-orange-800 shadow-lg">
                <svg viewBox="0 0 100 100" className="w-5 h-5 fill-yellow-100">
                  <path d="M50 25 C35 25, 25 35, 25 50 C25 55, 27 60, 30 64 L35 58 C33 55, 32 52, 32 50 C32 40, 40 32, 50 32 C60 32, 68 40, 68 50 C68 52, 67 55, 65 58 L70 64 C73 60, 75 55, 75 50 C75 35, 65 25, 50 25 Z M20 45 C15 40, 12 35, 15 30 C18 25, 25 27, 30 32 M80 45 C85 40, 88 35, 85 30 C82 25, 75 27, 70 32"/>
                </svg>
              </div>
              <div className="ml-2">
                <h1 className="text-sm font-bold text-orange-700">ANGELIN</h1>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {/* Home Button Mobile */}
              {selectedEstablishment && onHome && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onHome}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <Home size={16} />
                </Button>
              )}

              {/* Cart Button Mobile */}
              <Button
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                className="relative"
                size="sm"
              >
                <ShoppingCart size={16} />
                {cartState.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>

              {/* Admin Button Mobile */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/admin"}
              >
                <Shield size={16} />
              </Button>
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="pb-3 px-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Buscar estabelecimentos, produtos ou categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 text-sm"
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            </form>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center border-2 border-orange-800 shadow-lg">
                  <svg viewBox="0 0 100 100" className="w-7 h-7 fill-yellow-100">
                    <path d="M50 25 C35 25, 25 35, 25 50 C25 55, 27 60, 30 64 L35 58 C33 55, 32 52, 32 50 C32 40, 40 32, 50 32 C60 32, 68 40, 68 50 C68 52, 67 55, 65 58 L70 64 C73 60, 75 55, 75 50 C75 35, 65 25, 50 25 Z M20 45 C15 40, 12 35, 15 30 C18 25, 25 27, 30 32 M80 45 C85 40, 88 35, 85 30 C82 25, 75 27, 70 32 M40 50 C40 47, 42 45, 45 45 C48 45, 50 47, 50 50 C50 53, 48 55, 45 55 C42 55, 40 53, 40 50 M50 50 C50 47, 52 45, 55 45 C58 45, 60 47, 60 50 C60 53, 58 55, 55 55 C52 55, 50 53, 50 50 M35 60 C37 62, 40 65, 45 65 C50 65, 55 65, 60 62 C62 60, 65 62, 65 60 L60 65 C55 70, 50 75, 45 70 C40 65, 35 60, 35 60"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-orange-700">CARNES ANGELIN</h1>
                <p className="text-xs text-orange-600">Açougue Premium</p>
              </div>
              {selectedEstablishment && onHome && (
                <Button 
                  variant="ghost" 
                  className="ml-4 flex items-center space-x-2 text-slate-600 hover:text-slate-900"
                  onClick={onHome}
                >
                  <Home size={16} />
                  <span className="text-sm">Home</span>
                </Button>
              )}
            </div>

            {/* Center Section */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Buscar estabelecimentos, produtos ou categorias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-10"
                />
                <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Button
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                className="relative"
              >
                <ShoppingCart className="mr-2" size={16} />
                <span className="hidden sm:inline">Carrinho</span>
                {cartState.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>

              {/* Admin Button */}
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = "/admin"}
              >
                <Shield size={16} />
                <span className="hidden sm:inline text-sm">Admin</span>
              </Button>

              {/* User Menu */}
              <Button variant="ghost" className="flex items-center space-x-2">
                <User size={20} />
                <span className="hidden sm:inline text-sm">Minha Conta</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
