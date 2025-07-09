import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, QrCode } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_51234567890");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { state: cartState, dispatch } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const deliveryFee = 5.00;
  const subtotal = cartState.total;
  const total = subtotal + deliveryFee;

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar intenção de pagamento",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!formData.customerName || !formData.customerEmail || !formData.street) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Create order
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
          deliveryFee: deliveryFee.toString(),
          establishmentId: cartState.items[0]?.product.establishmentId || 1,
        },
        items: cartState.items.map(item => ({
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
          description: "Seu pedido foi criado com sucesso. Você receberá o QR Code do PIX por email.",
        });
        
        dispatch({ type: "CLEAR_CART" });
        setLocation("/");
      } else {
        // For credit card, process with Stripe
        if (!stripe || !elements) {
          setIsProcessing(false);
          return;
        }

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
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
          setLocation("/");
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Create payment intent when credit card is selected
  useEffect(() => {
    if (paymentMethod === "credit_card" && !clientSecret) {
      createPaymentIntentMutation.mutate(total);
    }
  }, [paymentMethod, total, clientSecret]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Finalizar Compra</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Cliente</CardTitle>
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
                    <div className="md:col-span-2">
                      <Label htmlFor="customerPhone">Telefone</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <CardTitle>Método de Pagamento</CardTitle>
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
                    <CardTitle>Dados do Cartão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentElement />
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? "Processando..." : "Confirmar Pedido"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartState.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.quantity}x R$ {Number(item.product.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-medium">
                        R$ {(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Taxa de entrega:</span>
                    <span>R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Checkout() {
  const { state: cartState } = useCart();
  const [, setLocation] = useLocation();

  // Redirect if cart is empty
  if (cartState.items.length === 0) {
    setLocation("/");
    return null;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
