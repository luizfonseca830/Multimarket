# Plataforma de E-commerce Multi-Estabelecimentos

## Visão Geral

Esta é uma aplicação de e-commerce completa construída com React, TypeScript, Express e PostgreSQL. A plataforma suporta múltiplos tipos de estabelecimentos (supermercados, açougues, padarias) com um sistema unificado de carrinho de compras e checkout. A aplicação possui uma interface moderna construída com componentes shadcn/ui e inclui interfaces tanto para clientes quanto para administradores.

O sistema é projetado para um único proprietário gerenciando múltiplos estabelecimentos (supermercado, açougue, padaria) com:
- Gerenciamento de catálogo de produtos por estabelecimento
- Organização de produtos baseada em categorias
- Carrinho de compras com pagamentos PIX e cartão de crédito
- Painel administrativo para controle de pagamentos
- Gestão e acompanhamento de pedidos

## Preferências do Usuário

Estilo de comunicação preferido: Linguagem simples e cotidiana.
Idioma: Português (Brasileiro)

## Mudanças Recentes (Janeiro 2025)

### Identidade Visual GRUPO ANGELIN e Melhorias (Atual - Janeiro 2025)
- **Nova Identidade Visual**: Aplicada a marca "GRUPO ANGELIN" em todo o sistema
  - Esquema de cores baseado na logo: dourado/âmbar e preto
  - Ícone personalizado do grupo em SVG no header e estabelecimentos gerais
  - Ícone de touro exclusivo para estabelecimentos do tipo açougue
  - Gradientes elegantes nos cards e botões
  - Tipografia e cores que refletem a identidade da rede de estabelecimentos
- **Corrigido Fluxo do Modal de Checkout**: Resolvido problema onde o modal de checkout não abria adequadamente
- **Experiência do Usuário Melhorada**: 
  - Modal agora abre sobre o carrinho sem fechá-lo
  - Usuários podem facilmente retornar ao carrinho se cancelarem o checkout
  - Transição suave entre carrinho e checkout
- **Exibição de Produtos Aprimorada**:
  - Corrigidas imagens de produtos em todos os componentes
  - Formatação adequada de preços com duas casas decimais
  - Funcionalidade consistente de adicionar ao carrinho
- **Melhorias no Carrinho**:
  - Adicionado CartSidebar a todas as páginas
  - Resumo completo do carrinho com subtotal, taxa de entrega e total
  - Melhores controles de quantidade e remoção de itens
- **Correções de Navegação**:
  - Corrigida exibição do botão Home quando estabelecimento é selecionado
  - Design responsivo melhorado para dispositivos móveis
- **Integração de Pagamento**: Suporte a PIX e cartão de crédito com integração Stripe

### Sistema de Busca Global Completo e Navegação de Estabelecimentos
- **Experiência de Busca Unificada**: Implementada busca global abrangente com navegação de estabelecimentos
- **Componente de Busca Global**: Criada busca unificada que busca simultaneamente estabelecimentos, produtos e categorias
- **Visualização Detalhada de Estabelecimentos**: Adicionadas páginas dedicadas de estabelecimentos mostrando produtos e categorias
- **Fluxo de Usuário Aprimorado**:
  1. Usuário inicia na página inicial com busca global ou seleção de estabelecimento
  2. Clicar no estabelecimento mostra seus produtos organizados por categorias
  3. Busca global funciona em todos os estabelecimentos, produtos e categorias
  4. Resultados exibidos em abas organizadas (Todos, Estabelecimentos, Produtos, Categorias)
  5. Botão Home aparece ao visualizar detalhes do estabelecimento
- **Melhorias na Navegação**: 
  - Botão Home no cabeçalho quando estabelecimento é selecionado
  - Botão Voltar na visualização do estabelecimento
  - Filtragem de categorias dentro dos estabelecimentos
- **Otimização Mobile**: Adicionadas otimizações CSS específicas para Galaxy S23 Ultra (428x915px)
- **Design Responsivo**: Responsividade aprimorada com abordagem mobile-first

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