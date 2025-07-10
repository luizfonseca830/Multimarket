import { 
  establishments, 
  categories, 
  products, 
  orders, 
  orderItems, 
  offers,
  adminUsers,
  productSales,
  type Establishment,
  type InsertEstablishment,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
  type Offer,
  type InsertOffer,
  type AdminUser,
  type CategoryWithProducts
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Establishments
  getEstablishments(): Promise<Establishment[]>;
  getEstablishment(id: number): Promise<Establishment | undefined>;
  createEstablishment(establishment: InsertEstablishment): Promise<Establishment>;
  
  // Categories
  getCategoriesByEstablishment(establishmentId: number): Promise<Category[]>;
  getCategoriesWithProducts(establishmentId: number): Promise<CategoryWithProducts[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProductsByEstablishment(establishmentId: number, sortBy?: string): Promise<ProductWithCategory[]>;
  getProductsByCategory(categoryId: number): Promise<ProductWithCategory[]>;
  getFeaturedProducts(establishmentId: number): Promise<ProductWithCategory[]>;
  getProduct(id: number): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  searchProducts(establishmentId: number, query: string): Promise<ProductWithCategory[]>;
  searchAllProducts(query: string): Promise<ProductWithCategory[]>;
  searchAllCategories(query: string): Promise<Category[]>;
  
  // Orders
  getOrdersByEstablishment(establishmentId: number): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Order>;
  
  // Order Items
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Offers
  getOffersByEstablishment(establishmentId: number): Promise<Offer[]>;
  getActiveOffers(establishmentId: number): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  
  // Admin Authentication
  authenticateAdmin(username: string, password: string): Promise<AdminUser | null>;
  getAdminByEmail(email: string): Promise<AdminUser | null>;
  
  // Dashboard Stats
  getDashboardStats(establishmentId: number): Promise<{
    todaysSales: number;
    todaysOrders: number;
    totalProducts: number;
    totalEstablishments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Establishments
  async getEstablishments(): Promise<Establishment[]> {
    return await db.select().from(establishments).where(eq(establishments.isActive, true));
  }

  async getEstablishment(id: number): Promise<Establishment | undefined> {
    const [establishment] = await db.select().from(establishments).where(eq(establishments.id, id));
    return establishment || undefined;
  }

  async createEstablishment(establishment: InsertEstablishment): Promise<Establishment> {
    const [newEstablishment] = await db.insert(establishments).values(establishment).returning();
    return newEstablishment;
  }

  // Categories
  async getCategoriesByEstablishment(establishmentId: number): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.establishmentId, establishmentId));
  }

  async getCategoriesWithProducts(establishmentId: number): Promise<CategoryWithProducts[]> {
    const result = await db.select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
      establishmentId: categories.establishmentId,
      products: sql`COALESCE(json_agg(${products}) filter (where ${products.id} is not null), '[]'::json)`.as('products')
    })
    .from(categories)
    .leftJoin(products, and(eq(categories.id, products.categoryId), eq(products.isActive, true)))
    .where(eq(categories.establishmentId, establishmentId))
    .groupBy(categories.id);

    return result.map(row => ({
      ...row,
      products: Array.isArray(row.products) ? row.products : []
    })) as CategoryWithProducts[];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Products
  async getProductsByEstablishment(establishmentId: number, sortBy?: string): Promise<ProductWithCategory[]> {
    let query = db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      unit: products.unit,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      establishmentId: products.establishmentId,
      createdAt: products.createdAt,
      category: categories
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.establishmentId, establishmentId), eq(products.isActive, true)));

    // Add sorting based on sortBy parameter
    switch (sortBy) {
      case 'price_asc':
        return await query.orderBy(asc(products.price));
      case 'price_desc':
        return await query.orderBy(desc(products.price));
      case 'name_asc':
        return await query.orderBy(asc(products.name));
      case 'name_desc':
        return await query.orderBy(desc(products.name));
      case 'best_sellers':
        // Join with productSales and order by quantity sold
        return await db.select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          originalPrice: products.originalPrice,
          unit: products.unit,
          stock: products.stock,
          imageUrl: products.imageUrl,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          categoryId: products.categoryId,
          establishmentId: products.establishmentId,
          createdAt: products.createdAt,
          category: categories
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(productSales, eq(products.id, productSales.productId))
        .where(and(eq(products.establishmentId, establishmentId), eq(products.isActive, true)))
        .orderBy(desc(sql`COALESCE(${productSales.quantitySold}, 0)`));
      case 'discount':
        // Order by discount percentage (original price vs current price)
        return await query.orderBy(desc(sql`CASE WHEN ${products.originalPrice} IS NOT NULL THEN (${products.originalPrice} - ${products.price}) / ${products.originalPrice} * 100 ELSE 0 END`));
      default:
        return await query.orderBy(desc(products.createdAt));
    }
  }

  async getProductsByCategory(categoryId: number): Promise<ProductWithCategory[]> {
    return await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      unit: products.unit,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      establishmentId: products.establishmentId,
      createdAt: products.createdAt,
      category: categories
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(establishmentId: number): Promise<ProductWithCategory[]> {
    return await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      unit: products.unit,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      establishmentId: products.establishmentId,
      createdAt: products.createdAt,
      category: categories
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.establishmentId, establishmentId), eq(products.isFeatured, true), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const [product] = await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      unit: products.unit,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      establishmentId: products.establishmentId,
      createdAt: products.createdAt,
      category: categories
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id));
    
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async searchProducts(establishmentId: number, query: string): Promise<ProductWithCategory[]> {
    return await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      unit: products.unit,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      establishmentId: products.establishmentId,
      createdAt: products.createdAt,
      category: categories
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.establishmentId, establishmentId),
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(categories.name, `%${query}%`)
        )
      )
    )
    .orderBy(products.name);
  }

  async searchAllProducts(query: string): Promise<ProductWithCategory[]> {
    return await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      unit: products.unit,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      establishmentId: products.establishmentId,
      createdAt: products.createdAt,
      category: categories
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(categories.name, `%${query}%`)
        )
      )
    )
    .orderBy(products.name)
    .limit(20);
  }

  async searchAllCategories(query: string): Promise<Category[]> {
    return await db.select()
      .from(categories)
      .where(ilike(categories.name, `%${query}%`))
      .orderBy(categories.name)
      .limit(20);
  }

  // Orders
  async getOrdersByEstablishment(establishmentId: number): Promise<OrderWithItems[]> {
    const ordersResult = await db.select().from(orders)
      .where(eq(orders.establishmentId, establishmentId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(ordersResult.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: products
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        orderItems: items
      };
    }));

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      product: products
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      orderItems: items
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Order> {
    const updateData: any = { paymentStatus };
    if (paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId;
    }
    
    const [updatedOrder] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }

  // Order Items
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    
    // Update product sales data
    await this.updateProductSales(orderItem.productId, orderItem.quantity, parseFloat(orderItem.price));
    
    return newOrderItem;
  }

  async updateProductSales(productId: number, quantity: number, unitPrice: number): Promise<void> {
    const totalRevenue = quantity * unitPrice;
    
    // Check if product sales record exists
    const [existingSales] = await db
      .select()
      .from(productSales)
      .where(eq(productSales.productId, productId));

    if (existingSales) {
      // Update existing record
      await db
        .update(productSales)
        .set({
          quantitySold: existingSales.quantitySold + quantity,
          totalRevenue: (parseFloat(existingSales.totalRevenue) + totalRevenue).toFixed(2),
          lastSaleDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(productSales.productId, productId));
    } else {
      // Get product to find establishment ID
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));

      if (product) {
        // Create new sales record
        await db
          .insert(productSales)
          .values({
            productId,
            establishmentId: product.establishmentId,
            quantitySold: quantity,
            totalRevenue: totalRevenue.toFixed(2),
            lastSaleDate: new Date(),
          });
      }
    }
  }

  // Offers
  async getOffersByEstablishment(establishmentId: number): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.establishmentId, establishmentId)).orderBy(desc(offers.createdAt));
  }

  async getActiveOffers(establishmentId: number): Promise<Offer[]> {
    return await db.select().from(offers)
      .where(and(eq(offers.establishmentId, establishmentId), eq(offers.isActive, true)))
      .orderBy(desc(offers.createdAt));
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  // Admin Authentication
  async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(and(
        eq(adminUsers.username, username),
        eq(adminUsers.password, password),
        eq(adminUsers.isActive, true)
      ));
    
    return admin || null;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(and(
        eq(adminUsers.email, email),
        eq(adminUsers.isActive, true)
      ));
    
    return admin || null;
  }

  // Dashboard Stats
  async getDashboardStats(establishmentId: number): Promise<{
    todaysSales: number;
    todaysOrders: number;
    totalProducts: number;
    totalEstablishments: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [todaysSalesResult] = await db.select({
      total: sql`COALESCE(SUM(${orders.totalAmount}), 0)`.as('total')
    })
    .from(orders)
    .where(and(
      eq(orders.establishmentId, establishmentId),
      sql`DATE(${orders.createdAt}) = ${today}`,
      eq(orders.paymentStatus, 'paid')
    ));

    const [todaysOrdersResult] = await db.select({
      count: sql`COUNT(*)`.as('count')
    })
    .from(orders)
    .where(and(
      eq(orders.establishmentId, establishmentId),
      sql`DATE(${orders.createdAt}) = ${today}`
    ));

    const [totalProductsResult] = await db.select({
      count: sql`COUNT(*)`.as('count')
    })
    .from(products)
    .where(and(eq(products.establishmentId, establishmentId), eq(products.isActive, true)));

    const [totalEstablishmentsResult] = await db.select({
      count: sql`COUNT(*)`.as('count')
    })
    .from(establishments)
    .where(eq(establishments.isActive, true));

    return {
      todaysSales: Number(todaysSalesResult.total) || 0,
      todaysOrders: Number(todaysOrdersResult.count) || 0,
      totalProducts: Number(totalProductsResult.count) || 0,
      totalEstablishments: Number(totalEstablishmentsResult.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
