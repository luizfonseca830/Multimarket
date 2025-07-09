import { db } from "./db";
import { establishments, categories, products, offers, adminUsers } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(offers);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(establishments);
  await db.delete(adminUsers);

  // Create establishments
  const [supermarket] = await db.insert(establishments).values({
    name: "Supermercado Central",
    type: "supermarket",
    description: "Alimentação e produtos gerais",
    icon: "shopping-cart",
    isActive: true,
  }).returning();

  const [butcher] = await db.insert(establishments).values({
    name: "Açougue Premium",
    type: "butcher", 
    description: "Carnes e embutidos",
    icon: "cut",
    isActive: true,
  }).returning();

  const [bakery] = await db.insert(establishments).values({
    name: "Padaria Artesanal",
    type: "bakery",
    description: "Pães e doces",
    icon: "bread-slice",
    isActive: true,
  }).returning();

  // Create categories for supermarket
  const [fruitsCategory] = await db.insert(categories).values({
    name: "Frutas e Verduras",
    icon: "carrot",
    color: "green",
    establishmentId: supermarket.id,
  }).returning();

  const [dairyCategory] = await db.insert(categories).values({
    name: "Laticínios",
    icon: "cheese",
    color: "blue", 
    establishmentId: supermarket.id,
  }).returning();

  const [cleaningCategory] = await db.insert(categories).values({
    name: "Limpeza",
    icon: "spray-can",
    color: "purple",
    establishmentId: supermarket.id,
  }).returning();

  const [babyCategory] = await db.insert(categories).values({
    name: "Bebê",
    icon: "baby",
    color: "pink",
    establishmentId: supermarket.id,
  }).returning();

  // Create categories for butcher
  const [meatCategory] = await db.insert(categories).values({
    name: "Carnes",
    icon: "drumstick-bite",
    color: "red",
    establishmentId: butcher.id,
  }).returning();

  const [sausagesCategory] = await db.insert(categories).values({
    name: "Embutidos",
    icon: "sausage",
    color: "orange",
    establishmentId: butcher.id,
  }).returning();

  // Create categories for bakery
  const [breadCategory] = await db.insert(categories).values({
    name: "Pães",
    icon: "bread-slice",
    color: "yellow",
    establishmentId: bakery.id,
  }).returning();

  const [sweetsCategory] = await db.insert(categories).values({
    name: "Doces",
    icon: "cake",
    color: "pink",
    establishmentId: bakery.id,
  }).returning();

  // Create products for supermarket
  const [apple] = await db.insert(products).values({
    name: "Maçã Red Delicious",
    description: "Maçã vermelha doce e crocante",
    price: "6.74",
    originalPrice: "8.99",
    unit: "kg",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: true,
    categoryId: fruitsCategory.id,
    establishmentId: supermarket.id,
  }).returning();

  await db.insert(products).values({
    name: "Banana Nanica",
    description: "Banana madura e doce",
    price: "4.50",
    unit: "kg",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: fruitsCategory.id,
    establishmentId: supermarket.id,
  });

  await db.insert(products).values({
    name: "Tomate Italiano",
    description: "Tomate fresco para saladas",
    price: "7.20",
    unit: "kg",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1546470427-e2a65b6e3d73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: fruitsCategory.id,
    establishmentId: supermarket.id,
  });

  const [milk] = await db.insert(products).values({
    name: "Leite Integral",
    description: "Leite integral 1L - Marca Premium",
    price: "4.24",
    originalPrice: "4.99",
    unit: "unidade",
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: true,
    categoryId: dairyCategory.id,
    establishmentId: supermarket.id,
  }).returning();

  await db.insert(products).values({
    name: "Queijo Mussarela",
    description: "Queijo mussarela fatiado 200g",
    price: "12.90",
    unit: "unidade",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: dairyCategory.id,
    establishmentId: supermarket.id,
  });

  // Create products for butcher
  const [picanha] = await db.insert(products).values({
    name: "Picanha Premium",
    description: "Picanha premium corte especial",
    price: "45.90",
    unit: "kg",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: true,
    categoryId: meatCategory.id,
    establishmentId: butcher.id,
  }).returning();

  await db.insert(products).values({
    name: "Alcatra",
    description: "Alcatra macia para churrasco",
    price: "32.50",
    unit: "kg",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1588347818121-2d9c50c0c87e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: meatCategory.id,
    establishmentId: butcher.id,
  });

  await db.insert(products).values({
    name: "Linguiça Toscana",
    description: "Linguiça toscana artesanal",
    price: "18.90",
    unit: "kg",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: sausagesCategory.id,
    establishmentId: butcher.id,
  });

  // Create products for bakery
  const [frenchBread] = await db.insert(products).values({
    name: "Pão Francês",
    description: "Pão francês fresco do dia",
    price: "12.50",
    unit: "kg",
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: true,
    categoryId: breadCategory.id,
    establishmentId: bakery.id,
  }).returning();

  await db.insert(products).values({
    name: "Pão Integral",
    description: "Pão integral com grãos",
    price: "8.90",
    unit: "unidade",
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: breadCategory.id,
    establishmentId: bakery.id,
  });

  await db.insert(products).values({
    name: "Bolo de Chocolate",
    description: "Bolo de chocolate caseiro",
    price: "25.00",
    unit: "unidade",
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    isActive: true,
    isFeatured: false,
    categoryId: sweetsCategory.id,
    establishmentId: bakery.id,
  });

  // Create offers
  await db.insert(offers).values({
    title: "25% OFF em Maçãs",
    description: "Desconto especial em maçãs red delicious",
    discountPercentage: 25,
    productId: apple.id,
    establishmentId: supermarket.id,
    isActive: true,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });

  await db.insert(offers).values({
    title: "15% OFF em Leite",
    description: "Promoção especial em leite integral",
    discountPercentage: 15,
    productId: milk.id,
    establishmentId: supermarket.id,
    isActive: true,
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  });

  // Create admin user
  await db.insert(adminUsers).values({
    username: "admin",
    password: "admin", // Note: In production, this should be hashed
    isActive: true,
  });

  console.log("Database seeded successfully!");
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(console.error);
}

export { seed };
