import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import crypto from 'crypto';

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
      const products = await storage.getProductsByEstablishment(establishmentId);
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

  const httpServer = createServer(app);
  return httpServer;
}
