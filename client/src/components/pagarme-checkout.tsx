import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CartItem } from "@/lib/cart-context";

interface PagarmeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  establishmentId: number;
}

export function PagarmeCheckoutModal({ isOpen, onClose, cartItems, total, establishmentId }: PagarmeCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
  });
  const [addressData, setAddressData] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
  });
  const [cardData, setCardData] = useState({
    number: '',
    holder_name: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderData = {
        customer: customerData,
        address: addressData,
        items: cartItems.map(item => ({
          id: item.product.id.toString(),
          description: item.product.name,
          quantity: item.quantity,
          price: Math.round(Number(item.product.price) * 100), // Converter para centavos
        })),
        payment_method: paymentMethod,
        card: paymentMethod === 'credit_card' ? cardData : undefined,
        establishment_id: establishmentId,
        total_amount: Math.round(total * 100), // Converter para centavos
      };

      const response = await apiRequest('POST', '/api/pagarme/create-order', orderData);
      const result = await response.json();

      if (result.success) {
        if (paymentMethod === 'pix') {
          // Mostrar QR Code do PIX
          toast({
            title: "PIX Gerado!",
            description: "Use o QR Code ou código PIX para finalizar o pagamento.",
          });
          // Aqui você pode mostrar o QR Code em um modal separado
        } else {
          toast({
            title: "Pagamento Aprovado!",
            description: "Seu pedido foi processado com sucesso.",
          });
        }
        onClose();
      } else {
        throw new Error(result.error || 'Erro no processamento do pagamento');
      }
    } catch (error: any) {
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Finalizar Compra - GRUPO ANGELIN</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Resumo do Pedido</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.establishmentId}`} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Método de Pagamento */}
            <div>
              <Label className="text-base font-semibold">Método de Pagamento</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Card 
                  className={`cursor-pointer border-2 ${paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <CardContent className="flex items-center justify-center p-4">
                    <CreditCard className="mr-2" size={20} />
                    <span>Cartão de Crédito</span>
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer border-2 ${paymentMethod === 'pix' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <CardContent className="flex items-center justify-center p-4">
                    <Smartphone className="mr-2" size={20} />
                    <span>PIX</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div>
              <Label className="text-base font-semibold">Dados do Cliente</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="document">CPF</Label>
                  <Input
                    id="document"
                    value={customerData.document}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, document: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div>
              <Label className="text-base font-semibold">Endereço de Entrega</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={addressData.street}
                    onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={addressData.number}
                    onChange={(e) => setAddressData(prev => ({ ...prev, number: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={addressData.complement}
                    onChange={(e) => setAddressData(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={addressData.neighborhood}
                    onChange={(e) => setAddressData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={addressData.city}
                    onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={addressData.state}
                    onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipcode">CEP</Label>
                  <Input
                    id="zipcode"
                    value={addressData.zipcode}
                    onChange={(e) => setAddressData(prev => ({ ...prev, zipcode: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dados do Cartão (se cartão de crédito) */}
            {paymentMethod === 'credit_card' && (
              <div>
                <Label className="text-base font-semibold">Dados do Cartão</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="col-span-2">
                    <Label htmlFor="card_number">Número do Cartão</Label>
                    <Input
                      id="card_number"
                      value={cardData.number}
                      onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="0000 0000 0000 0000"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="holder_name">Nome no Cartão</Label>
                    <Input
                      id="holder_name"
                      value={cardData.holder_name}
                      onChange={(e) => setCardData(prev => ({ ...prev, holder_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp_month">Mês</Label>
                    <Input
                      id="exp_month"
                      value={cardData.exp_month}
                      onChange={(e) => setCardData(prev => ({ ...prev, exp_month: e.target.value }))}
                      placeholder="MM"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp_year">Ano</Label>
                    <Input
                      id="exp_year"
                      value={cardData.exp_year}
                      onChange={(e) => setCardData(prev => ({ ...prev, exp_year: e.target.value }))}
                      placeholder="AAAA"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="000"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Finalizar */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                disabled={isProcessing}
              >
                {isProcessing ? "Processando..." : 
                  paymentMethod === 'pix' ? "Gerar PIX" : "Finalizar Pagamento"
                }
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}