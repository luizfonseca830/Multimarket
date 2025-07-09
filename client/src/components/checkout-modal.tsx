import { useState, useRef, useEffect } from "react";
import { X, CreditCard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_51234567890");

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  total: number;
}

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
  };
  paymentMethod: "pix" | "credit_card";
  totalAmount: number;
  deliveryFee: number;
  establishmentId: number;
}

function CheckoutForm({ onClose, cartItems, total }: Omit<CheckoutModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { dispatch } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.street) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create order first
      const orderData = {
        order: {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          deliveryAddress: {
            zipCode: formData.zipCode,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
          },
          paymentMethod,
          totalAmount: total.toString(),
          deliveryFee: "5.00",
          establishmentId: cartItems[0]?.product.establishmentId || 1,
        },
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      if (paymentMethod === "pix") {
        // For PIX, simulate payment success
        toast({
          title: "Pedido Criado!",
          description: "Seu pedido foi criado com sucesso. Aguarde o QR Code do PIX.",
        });
        
        // Clear cart and close modal
        dispatch({ type: "CLEAR_CART" });
        onClose();
      } else {
        // For credit card, create payment intent
        await createPaymentIntentMutation.mutateAsync(total);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Erro no Pagamento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pagamento Aprovado!",
        description: "Seu pedido foi processado com sucesso.",
      });
      
      dispatch({ type: "CLEAR_CART" });
      onClose();
    }
  };

  const subtotal = total - 5; // Remove delivery fee

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-slate-600">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="text-slate-900">
                  R$ {(Number(item.product.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-slate-600">Taxa de entrega</span>
              <span className="text-slate-900">R$ 5,00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nome Completo *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Telefone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="street">Rua *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => handleInputChange("number", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => handleInputChange("complement", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "pix" | "credit_card")}>
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center cursor-pointer">
                  <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center mr-3">
                    <QrCode className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-slate-500">Pagamento instantâneo</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                    <CreditCard className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-slate-500">Visa, Mastercard, Elo</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment Element for Credit Cards */}
        {paymentMethod === "credit_card" && clientSecret && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Cartão</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentElement />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => {
            dispatch({ type: "OPEN_CART" });
            onClose();
          }} className="flex-1">
            Cancelar
          </Button>
          {paymentMethod === "credit_card" && clientSecret ? (
            <Button type="button" onClick={handlePaymentSubmit} className="flex-1">
              Confirmar Pagamento
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? "Processando..." : "Confirmar Pedido"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export function CheckoutModal({ isOpen, onClose, cartItems, total }: CheckoutModalProps) {
  const { dispatch } = useCart();
  
  // Fechar o carrinho quando o modal de checkout abrir
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "CLOSE_CART" });
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Finalizar Compra</h2>
            <Button variant="ghost" size="icon" onClick={() => {
              dispatch({ type: "OPEN_CART" });
              onClose();
            }}>
              <X size={20} />
            </Button>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm onClose={onClose} cartItems={cartItems} total={total} />
          </Elements>
        </div>
      </div>
    </div>
  );
}
