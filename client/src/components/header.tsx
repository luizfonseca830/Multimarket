import { Search, ShoppingCart, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { EstablishmentSelector } from "./establishment-selector";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HeaderProps {
  selectedEstablishment: any;
  onEstablishmentChange: (establishment: any) => void;
}

export function Header({ selectedEstablishment, onEstablishmentChange }: HeaderProps) {
  const { state: cartState, dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="text-white" size={20} />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-slate-900">Multi Store</h1>
              <p className="text-xs text-slate-500">Rede de Estabelecimentos</p>
            </div>
          </div>

          {/* Center Section */}
          <div className="flex items-center space-x-4">
            <EstablishmentSelector
              selectedEstablishment={selectedEstablishment}
              onEstablishmentChange={onEstablishmentChange}
            />

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10"
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

            {/* User Menu */}
            <Button variant="ghost" className="flex items-center space-x-2">
              <User size={20} />
              <span className="hidden sm:inline text-sm">Minha Conta</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
