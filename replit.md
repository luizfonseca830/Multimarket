# Multi-Store E-commerce Platform

## Overview

This is a full-stack e-commerce application built with React, TypeScript, Express, and PostgreSQL. The platform supports multiple types of establishments (supermarkets, butchers, bakeries) with a unified shopping cart and checkout system. The application features a modern UI built with shadcn/ui components and includes both customer-facing and admin interfaces.

The system is designed for a single owner managing multiple establishments (supermarket, butcher shop, bakery) with:
- Product catalog management per establishment
- Category-based product organization
- Shopping cart with PIX and credit card payments
- Administrative dashboard for payment control
- Order management and tracking

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Portuguese (Brazilian)

## Recent Changes (July 2025)

### Enhanced Homepage and User Experience
- **New Homepage Layout**: Created a welcoming homepage that displays all establishments first, allowing users to choose before shopping
- **Search Functionality**: Implemented comprehensive product search that filters by name, description, and category
- **Dynamic Navigation**: Navigation menu now changes based on selected establishment, showing relevant categories as tabs
- **Improved User Flow**: 
  1. User starts on homepage with establishment selection
  2. After choosing establishment, dynamic category tabs appear
  3. Search functionality works across all products in selected establishment
  4. Offers section prominently displayed on homepage
- **Enhanced Search**: Added dedicated search results page with clear filtering and product display

### Admin Authentication System (January 2025)
- **Removed Category Navigation**: Eliminated the top category menu as requested
- **Enhanced Admin User Model**: Added email field to admin users (luizfonseca830@gmail.com)
- **Admin Authentication**: Complete login system with secure token-based authentication
- **Password Recovery**: Implemented password recovery system via email
- **Admin Access**: Added "Admin" button in header for secure access to admin panel
- **User Interface**: Clean admin login page with password recovery option
- **Database Updates**: Updated admin_users table with email field for password recovery

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Context for cart state, React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful endpoints with consistent JSON responses
- **Session Management**: express-session with PostgreSQL store
- **Payment Processing**: Stripe integration for credit card payments

### Database Schema
- **establishments**: Store information (name, type, description, icon)
- **categories**: Product categories linked to establishments
- **products**: Product catalog with pricing, stock, and metadata
- **orders**: Customer orders with delivery and payment information
- **order_items**: Line items for each order
- **offers**: Promotional offers and discounts

## Key Components

### Product Management
- Multi-establishment support with different store types
- Category-based product organization
- Featured products system
- Stock management
- Image handling for products

### Shopping Cart
- Persistent cart state using React Context
- Real-time quantity updates
- Support for multiple products from same establishment
- Delivery fee calculation

### Checkout System
- Customer information collection
- Address validation
- Multiple payment methods (PIX and Credit Card via Stripe)
- Order confirmation and tracking

### Admin Dashboard
- Order management and status updates
- Product catalog management
- Sales analytics and reporting
- Inventory tracking

## Data Flow

1. **Product Discovery**: Users browse establishments and categories to find products
2. **Cart Management**: Products are added to cart with quantity tracking
3. **Checkout Process**: Customer provides delivery and payment information
4. **Payment Processing**: Stripe handles credit card payments, PIX handled separately
5. **Order Fulfillment**: Orders are processed and status updated in admin dashboard

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and migrations
- **@stripe/stripe-js**: Payment processing integration
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui**: Headless UI components for accessibility

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production server
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Neon Database with connection pooling

### Production
- **Build Process**: 
  - Client: Vite builds static assets to `dist/public`
  - Server: esbuild bundles Express app to `dist/index.js`
- **Deployment**: Single server deployment with static file serving
- **Environment**: Production environment variables for database and Stripe

### Database Management
- **Migrations**: Drizzle Kit handles schema changes
- **Seeding**: Seed script populates initial data for establishments and products
- **Connection**: Connection pooling for production performance

The application follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The architecture supports horizontal scaling and can be extended to support additional establishment types and payment methods.