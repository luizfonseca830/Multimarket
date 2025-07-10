import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Establishments table
export const establishments = pgTable("establishments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'supermarket', 'butcher', 'bakery'
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").default(true),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  unit: text("unit").notNull(), // 'kg', 'unit', 'liter', etc.
  stock: integer("stock").default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  deliveryAddress: jsonb("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'pix', 'credit_card'
  paymentStatus: text("payment_status").default('pending'), // 'pending', 'paid', 'failed'
  orderStatus: text("order_status").default('processing'), // 'processing', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default('5.00'),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Offers table
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  establishmentId: integer("establishment_id").references(() => establishments.id).notNull(),
  isActive: boolean("is_active").default(true),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product sales tracking table
export const productSales = pgTable("product_sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  establishmentId: integer("establishment_id").notNull().references(() => establishments.id, { onDelete: "cascade" }),
  quantitySold: integer("quantity_sold").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull().default("0.00"),
  lastSaleDate: timestamp("last_sale_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const establishmentsRelations = relations(establishments, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  orders: many(orders),
  offers: many(offers),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [categories.establishmentId],
    references: [establishments.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  establishment: one(establishments, {
    fields: [products.establishmentId],
    references: [establishments.id],
  }),
  orderItems: many(orderItems),
  offers: many(offers),
  sales: many(productSales),
}));

export const productSalesRelations = relations(productSales, ({ one }) => ({
  product: one(products, {
    fields: [productSales.productId],
    references: [products.id],
  }),
  establishment: one(establishments, {
    fields: [productSales.establishmentId],
    references: [establishments.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [orders.establishmentId],
    references: [establishments.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  product: one(products, {
    fields: [offers.productId],
    references: [products.id],
  }),
  establishment: one(establishments, {
    fields: [offers.establishmentId],
    references: [establishments.id],
  }),
}));

// Insert schemas
export const insertEstablishmentSchema = createInsertSchema(establishments).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true, isActive: true });
export const insertProductSalesSchema = createInsertSchema(productSales).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Establishment = typeof establishments.$inferSelect;
export type InsertEstablishment = z.infer<typeof insertEstablishmentSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type ProductSales = typeof productSales.$inferSelect;
export type InsertProductSales = z.infer<typeof insertProductSalesSchema>;

// Additional types for API responses
export type ProductWithCategory = Product & { category: Category };
export type OrderWithItems = Order & { orderItems: (OrderItem & { product: Product })[] };
export type CategoryWithProducts = Category & { products: Product[] };
