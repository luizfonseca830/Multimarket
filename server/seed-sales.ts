import { db } from "./db";
import { productSales } from "@shared/schema";

async function seedSalesData() {
  console.log("Seeding sales data...");
  
  // Create sample sales data for products
  const salesData = [
    // Supermercado products (establishment 7)
    { productId: 23, establishmentId: 7, quantitySold: 145, totalRevenue: "217.50", lastSaleDate: new Date() },
    { productId: 24, establishmentId: 7, quantitySold: 232, totalRevenue: "348.00", lastSaleDate: new Date() },
    { productId: 25, establishmentId: 7, quantitySold: 87, totalRevenue: "217.50", lastSaleDate: new Date() },
    { productId: 26, establishmentId: 7, quantitySold: 198, totalRevenue: "891.00", lastSaleDate: new Date() },
    { productId: 27, establishmentId: 7, quantitySold: 156, totalRevenue: "1872.00", lastSaleDate: new Date() },
    
    // Açougue products (establishment 8)
    { productId: 28, establishmentId: 8, quantitySold: 298, totalRevenue: "14900.00", lastSaleDate: new Date() },
    { productId: 29, establishmentId: 8, quantitySold: 156, totalRevenue: "6240.00", lastSaleDate: new Date() },
    { productId: 30, establishmentId: 8, quantitySold: 445, totalRevenue: "8900.00", lastSaleDate: new Date() },
    
    // Padaria products (establishment 9)
    { productId: 31, establishmentId: 9, quantitySold: 1234, totalRevenue: "6170.00", lastSaleDate: new Date() },
    { productId: 32, establishmentId: 9, quantitySold: 567, totalRevenue: "3402.00", lastSaleDate: new Date() },
    { productId: 33, establishmentId: 9, quantitySold: 234, totalRevenue: "3510.00", lastSaleDate: new Date() },
  ];

  try {
    // First, clear existing sales data
    await db.delete(productSales);
    
    // Insert new sales data
    await db.insert(productSales).values(salesData);
    
    console.log("Sales data seeded successfully!");
  } catch (error) {
    console.error("Error seeding sales data:", error);
  }
}

seedSalesData().catch(console.error);