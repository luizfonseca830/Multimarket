import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { CheckoutModal } from "./checkout-modal";

export function CartSidebar() {
  const { state, dispatch } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const deliveryFee = 5.00;
  const subtotal = state.total;
  const total = subtotal + deliveryFee;

  const updateQuantity = (productId: number, newQuantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity: newQuantity });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    // Fechar o carrinho após o modal ser criado
    setTimeout(() => {
      dispatch({ type: "CLOSE_CART" });
    }, 300);
  };

  if (!state.isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Carrinho de Compras</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "CLOSE_CART" })}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-slate-500">Seu carrinho está vazio</p>
                  <p className="text-slate-400 text-sm mt-2">Adicione produtos para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <img
                        src={item.product.imageUrl || `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100`}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{item.product.name}</h3>
                        <p className="text-slate-500 text-sm">
                          R$ {Number(item.product.price).toFixed(2)} / {item.product.unit}
                        </p>
                        
                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="mx-3 font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          R$ {(Number(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-1 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-slate-200 p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxa de entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold text-slate-900">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button onClick={handleCheckout} className="w-full">
                  Finalizar Compra
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={state.items}
          total={total}
        />
      )}
    </>
  );
}
