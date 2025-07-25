import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import crypto from 'crypto';
// @ts-ignore - PagarMe types not available
import pagarme from "pagarme";

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

  // PagarMe Integration
  app.post("/api/pagarme/create-order", async (req, res) => {
    try {
      const { customer, address, items, payment_method, card, establishment_id, total_amount } = req.body;

      // Validar dados obrigatórios
      if (!customer || !address || !items || !payment_method || !establishment_id) {
        return res.status(400).json({ 
          success: false, 
          error: "Dados obrigatórios não fornecidos" 
        });
      }

      // Para sandbox/teste, usar chave de teste do PagarMe
      const client = await pagarme.client.connect({
        api_key: process.env.PAGARME_API_KEY || 'ak_test_abcdefghijklmnopqrstuvwxyz123456'
      });

      // Criar transação
      const transaction = {
        amount: total_amount,
        card_number: payment_method === 'credit_card' ? card?.number?.replace(/\s/g, '') : undefined,
        card_cvv: payment_method === 'credit_card' ? card?.cvv : undefined,
        card_expiration_date: payment_method === 'credit_card' ? 
          `${card?.exp_month?.padStart(2, '0')}${card?.exp_year}` : undefined,
        card_holder_name: payment_method === 'credit_card' ? card?.holder_name : undefined,
        customer: {
          external_id: customer.document,
          name: customer.name,
          type: 'individual',
          country: 'br',
          email: customer.email,
          phone_numbers: [customer.phone],
          documents: [{
            type: 'cpf',
            number: customer.document.replace(/\D/g, '')
          }]
        },
        billing: {
          name: customer.name,
          address: {
            country: 'br',
            state: address.state,
            city: address.city,
            neighborhood: address.neighborhood,
            street: address.street,
            street_number: address.number,
            zipcode: address.zipcode.replace(/\D/g, '')
          }
        },
        shipping: {
          name: customer.name,
          fee: 500, // Taxa de entrega em centavos (R$ 5,00)
          address: {
            country: 'br',
            state: address.state,
            city: address.city,
            neighborhood: address.neighborhood,
            street: address.street,
            street_number: address.number,
            zipcode: address.zipcode.replace(/\D/g, '')
          }
        },
        items: items.map((item: any) => ({
          id: item.description.replace(/\s/g, '_').toLowerCase(),
          title: item.description,
          unit_price: item.price,
          quantity: item.quantity,
          tangible: true
        })),
        payment_method: payment_method,
        async: false
      };

      const result = await client.transactions.create(transaction);

      if (result.status === 'paid' || result.status === 'waiting_payment') {
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
          paymentStatus: result.status === 'paid' ? 'paid' : 'pending',
          orderStatus: 'processing',
          totalAmount: (total_amount / 100).toString(),
          deliveryFee: '5.00',
          establishmentId: establishment_id,
          pagarmeTransactionId: result.id.toString(),
          pagarmeOrderId: result.id.toString()
        };

        const order = await storage.createOrder(orderData);

        // Criar itens do pedido
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: parseInt(item.id) || 1, // Fallback se não tiver ID
            quantity: item.quantity,
            price: (item.price / 100).toString()
          });
        }

        res.json({
          success: true,
          order_id: order.id,
          transaction_id: result.id,
          status: result.status,
          payment_method: payment_method,
          ...(payment_method === 'pix' && {
            pix_qr_code: result.pix_qr_code,
            pix_expiration_date: result.pix_expiration_date
          })
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.refuse_reason || 'Pagamento rejeitado'
        });
      }
    } catch (error: any) {
      console.error('Erro PagarMe:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  // Webhook do PagarMe para receber atualizações de status
  app.post("/api/pagarme/webhook", async (req, res) => {
    try {
      const { object, current_status, id } = req.body;

      if (object === 'transaction') {
        // Atualizar status do pedido baseado na transação
        await storage.updateOrderByPagarmeId(id.toString(), {
          paymentStatus: current_status === 'paid' ? 'paid' : 
                         current_status === 'refused' ? 'failed' : 'pending'
        });
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Erro webhook PagarMe:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
