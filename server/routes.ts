import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import crypto from 'crypto';
import axios from 'axios';

// Use test key if no Stripe secret is provided
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890';

const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Establishments
  app.get("/api/establishments", async (req, res) => {
    try {
      const establishments = await storage.getEstablishments();
      res.json(establishments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching establishments: " + error.message });
    }
  });

  app.get("/api/establishments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const establishment = await storage.getEstablishment(id);
      if (!establishment) {
        return res.status(404).json({ message: "Establishment not found" });
      }
      res.json(establishment);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching establishment: " + error.message });
    }
  });

  // Categories
  app.get("/api/establishments/:id/categories", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const categories = await storage.getCategoriesByEstablishment(establishmentId);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.get("/api/establishments/:id/categories-with-products", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const categories = await storage.getCategoriesWithProducts(establishmentId);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories with products: " + error.message });
    }
  });

  // Products
  app.get("/api/establishments/:id/products", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const sortBy = req.query.sortBy as string;
      const products = await storage.getProductsByEstablishment(establishmentId, sortBy);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/establishments/:id/featured-products", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const products = await storage.getFeaturedProducts(establishmentId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching featured products: " + error.message });
    }
  });

  app.get("/api/categories/:id/products", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products by category: " + error.message });
    }
  });

  // Search products
  app.get("/api/establishments/:id/products/search", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const products = await storage.searchProducts(establishmentId, query);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error searching products: " + error.message });
    }
  });

  // Global search for products
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const products = await storage.searchAllProducts(query);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error searching all products: " + error.message });
    }
  });

  // Global search for categories
  app.get("/api/categories/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const categories = await storage.searchAllCategories(query);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error searching all categories: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  // Orders
  app.get("/api/establishments/:id/orders", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const orders = await storage.getOrdersByEstablishment(establishmentId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  const createOrderSchema = z.object({
    order: insertOrderSchema,
    items: z.array(insertOrderItemSchema.omit({ orderId: true }))
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = createOrderSchema.parse(req.body);
      
      // Create the order
      const newOrder = await storage.createOrder(order);
      
      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          ...item,
          orderId: newOrder.id
        });
      }
      
      res.json(newOrder);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating order status: " + error.message });
    }
  });

  // Offers
  app.get("/api/establishments/:id/offers", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const offers = await storage.getOffersByEstablishment(establishmentId);
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching offers: " + error.message });
    }
  });

  app.get("/api/establishments/:id/active-offers", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const offers = await storage.getActiveOffers(establishmentId);
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching active offers: " + error.message });
    }
  });

  // Dashboard Stats
  app.get("/api/establishments/:id/stats", async (req, res) => {
    try {
      const establishmentId = parseInt(req.params.id);
      const stats = await storage.getDashboardStats(establishmentId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching dashboard stats: " + error.message });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "brl",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Update payment status after successful payment
  app.post("/api/orders/:id/payment-success", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentIntentId } = req.body;
      
      const updatedOrder = await storage.updateOrderPaymentStatus(id, 'paid', paymentIntentId);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating payment status: " + error.message });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const admin = await storage.authenticateAdmin(username, password);
      
      if (admin) {
        // Generate a simple token (in production, use proper JWT)
        const token = crypto.randomBytes(32).toString('hex');
        res.json({ 
          success: true, 
          token,
          admin: { id: admin.id, username: admin.username }
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error during authentication: " + error.message });
    }
  });

  // Password recovery
  app.post("/api/admin/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const admin = await storage.getAdminByEmail(email);
      
      if (admin) {
        // In a real application, you would send an email here
        // For now, we'll just log the password reset info
        console.log(`Password reset requested for admin: ${admin.username} (${admin.email})`);
        console.log(`Current password: admin`);
        
        res.json({ 
          success: true, 
          message: "Password reset email sent" 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: "Email not found" 
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error during password recovery: " + error.message });
    }
  });

  // PagarMe v5 Integration
  app.post("/api/pagarme/create-order", async (req, res) => {
    try {
      const { customer, address, items, payment_method, card, establishment_id, total_amount } = req.body;

      // Validar dados obrigatórios
      if (!customer || !address || !items || !payment_method || !establishment_id) {
        console.log('Dados recebidos:', { customer, address, items, payment_method, establishment_id });
        return res.status(400).json({ 
          success: false, 
          error: "Dados obrigatórios não fornecidos",
          received: { customer: !!customer, address: !!address, items: !!items, payment_method: !!payment_method, establishment_id: !!establishment_id }
        });
      }

      // Buscar configurações do estabelecimento
      const establishment = await storage.getEstablishment(establishment_id);
      if (!establishment) {
        return res.status(400).json({
          success: false,
          error: "Estabelecimento não encontrado"
        });
      }

      // Usar chave PagarMe específica do estabelecimento ou fallback para chave global
      const apiKey = establishment.pagarmeApiKey || process.env.PAGARME_API_KEY || 'sk_test_abcdefghijklmnopqrstuvwxyz';
      const authHeader = Buffer.from(`${apiKey}:`).toString('base64');

      // Preparar dados do cliente
      const customerData = {
        name: customer.name,
        email: customer.email,
        document: customer.document.replace(/\D/g, ''),
        type: 'individual',
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: customer.phone.substring(0, 2),
            number: customer.phone.substring(2)
          }
        },
        address: {
          line_1: `${address.number}, ${address.street}, ${address.neighborhood}`,
          line_2: address.complement || '',
          zip_code: address.zipcode.replace(/\D/g, ''),
          city: address.city,
          state: address.state,
          country: 'BR'
        }
      };

      // Preparar itens do pedido
      const orderItems = items.map((item: any) => ({
        code: item.id,
        description: item.description,
        amount: item.price,
        quantity: item.quantity
      }));

      // Preparar pagamento
      let paymentData: any = {};

      if (payment_method === 'credit_card') {
        paymentData = {
          payment_method: 'credit_card',
          credit_card: {
            card: {
              number: card.number.replace(/\s/g, ''),
              holder_name: card.holder_name,
              exp_month: parseInt(card.exp_month),
              exp_year: parseInt(card.exp_year),
              cvv: card.cvv
            }
          }
        };
      } else if (payment_method === 'pix') {
        paymentData = {
          payment_method: 'pix',
          pix: {
            expires_in: 3600 // 1 hora
          }
        };
      }

      // Criar pedido
      const orderRequest = {
        code: `ORDER_${Date.now()}`,
        items: orderItems,
        customer: customerData,
        payments: [{
          amount: total_amount,
          ...paymentData
        }],
        shipping: {
          amount: Math.round(parseFloat(establishment.deliveryFee || '5.00') * 100), // Taxa de entrega em centavos
          description: `Entrega ${establishment.name}`,
          recipient_name: customer.name,
          recipient_phone: customer.phone,
          address: customerData.address
        }
      };

      console.log('Criando pedido PagarMe:', JSON.stringify(orderRequest, null, 2));

      // Fazer requisição HTTP direta para API do PagarMe v5
      const result = await axios.post('https://api.pagar.me/core/v5/orders', orderRequest, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        }
      });

      if (result.data && (result.data.status === 'paid' || result.data.status === 'pending')) {
        // Salvar pedido no banco de dados
        const orderData = {
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          deliveryAddress: {
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode
          },
          paymentMethod: payment_method,
          paymentStatus: result.data.status === 'paid' ? 'paid' : 'pending',
          orderStatus: 'processing',
          totalAmount: (total_amount / 100).toString(),
          deliveryFee: establishment.deliveryFee || '5.00',
          establishmentId: establishment_id,
          pagarmeTransactionId: result.data.id,
          pagarmeOrderId: result.data.code
        };

        const order = await storage.createOrder(orderData);

        // Criar itens do pedido
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: parseInt(item.id) || 1,
            quantity: item.quantity,
            price: (item.price / 100).toString()
          });
        }

        const response: any = {
          success: true,
          order_id: order.id,
          transaction_id: result.data.id,
          status: result.data.status,
          payment_method: payment_method
        };

        // Para PIX, incluir dados do QR Code
        if (payment_method === 'pix' && result.data.charges && result.data.charges[0]) {
          const charge = result.data.charges[0];
          if (charge.last_transaction && charge.last_transaction.qr_code) {
            response.pix_qr_code = charge.last_transaction.qr_code;
            response.pix_qr_code_url = charge.last_transaction.qr_code_url;
          }
        }

        res.json(response);
      } else {
        const errorMessage = result.data?.charges?.[0]?.last_transaction?.gateway_response?.errors?.[0]?.message || 'Pagamento rejeitado';
        res.status(400).json({
          success: false,
          error: errorMessage
        });
      }
    } catch (error: any) {
      console.error('Erro PagarMe v5:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  // Webhook do PagarMe v5 para receber atualizações de status
  app.post("/api/pagarme/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;

      console.log('Webhook PagarMe recebido:', { type, data });

      if (type === 'order.paid' || type === 'order.payment_failed' || type === 'charge.paid') {
        const orderId = data.id || data.order_id;
        let paymentStatus = 'pending';

        switch (type) {
          case 'order.paid':
          case 'charge.paid':
            paymentStatus = 'paid';
            break;
          case 'order.payment_failed':
            paymentStatus = 'failed';
            break;
        }

        // Atualizar status do pedido baseado no webhook
        await storage.updateOrderByPagarmeId(orderId.toString(), {
          paymentStatus
        });
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Erro webhook PagarMe v5:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Configurar credenciais PagarMe por estabelecimento
  app.put("/api/admin/establishments/:id/pagarme", async (req, res) => {
    try {
      const { id } = req.params;
      const { pagarmeApiKey, pixKey, deliveryFee, cnpj } = req.body;

      // Buscar estabelecimento
      const establishment = await storage.getEstablishment(parseInt(id));
      if (!establishment) {
        return res.status(404).json({ 
          success: false, 
          error: "Estabelecimento não encontrado" 
        });
      }

      // Atualizar configurações PagarMe
      const updatedEstablishment = await storage.updateEstablishmentPaymentConfig(parseInt(id), {
        pagarmeApiKey,
        pixKey,
        deliveryFee: deliveryFee || '5.00',
        cnpj
      });

      res.json({
        success: true,
        establishment: {
          id: updatedEstablishment.id,
          name: updatedEstablishment.name,
          deliveryFee: updatedEstablishment.deliveryFee,
          hasPaymentConfig: !!updatedEstablishment.pagarmeApiKey
        }
      });
    } catch (error: any) {
      console.error('Erro ao configurar PagarMe:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  // Admin - Listar configurações de pagamento por estabelecimento
  app.get("/api/admin/establishments/:id/pagarme", async (req, res) => {
    try {
      const { id } = req.params;
      
      const establishment = await storage.getEstablishment(parseInt(id));
      if (!establishment) {
        return res.status(404).json({ 
          success: false, 
          error: "Estabelecimento não encontrado" 
        });
      }

      res.json({
        success: true,
        config: {
          establishmentName: establishment.name,
          hasPaymentConfig: !!establishment.pagarmeApiKey,
          deliveryFee: establishment.deliveryFee || '5.00',
          pixKey: establishment.pixKey ? '***' + establishment.pixKey.slice(-4) : null,
          cnpj: establishment.cnpj
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
