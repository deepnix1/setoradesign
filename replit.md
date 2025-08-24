# DeFi Farming Platform

## Overview

This project is a decentralized finance (DeFi) farming platform built with modern web technologies. The application allows users to stake tokens in farming pools, earn rewards, and participate in liquidity mining. The platform is designed to work with the Intuition blockchain testnet and provides a comprehensive interface for managing DeFi operations including staking, unstaking, and claiming rewards.

The system follows a full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database for managing user data and transaction history. The platform integrates directly with blockchain smart contracts using ethers.js for Web3 functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React 18 with TypeScript and is built using Vite for fast development and optimized production builds. The UI is constructed with shadcn/ui components built on Radix UI primitives, providing a modern and accessible design system. TailwindCSS handles styling with a custom design system including CSS variables for theming.

State management is handled through TanStack Query (React Query) for server state management and caching, with Wouter providing lightweight client-side routing. The frontend follows a component-based architecture with reusable UI components, custom hooks, and utility functions.

### Backend Architecture
The server is built with Express.js and follows a service-oriented architecture. Key architectural decisions include:

- **Route Registration Pattern**: Centralized route registration in `server/routes.ts` with modular service integration
- **Service Layer**: Separate services for blockchain operations (`BlockchainService`) and Web3 interactions (`Web3Service`)
- **Storage Abstraction**: Interface-based storage layer (`IStorage`) allowing for flexible database implementations
- **Middleware Chain**: Request logging, JSON parsing, and error handling middleware

The backend implements proper separation of concerns with distinct layers for routing, business logic, and data access.

### Database Design
Uses Drizzle ORM with PostgreSQL for type-safe database operations. The schema includes:

- **Users Table**: User authentication and wallet address management
- **Farming Pools**: Pool configurations, APY rates, and contract addresses
- **User Stakes**: Individual staking positions and pending rewards
- **Transactions**: Complete transaction history with blockchain integration
- **Network Stats**: Overall network statistics and analytics

The database design supports both single-asset and LP (liquidity provider) token farming with proper relationship mapping between users, pools, and stakes.

### Blockchain Integration
The platform integrates with Ethereum-compatible blockchains (specifically Intuition testnet) through:

- **Web3Service**: Core blockchain interactions including balance queries, gas estimation, and transaction monitoring
- **BlockchainService**: Higher-level farming operations including stake management, reward calculations, and pool statistics
- **Smart Contract Integration**: Direct interaction with farming pool contracts using ethers.js and predefined ABIs

The blockchain layer handles real-time data synchronization between on-chain state and the application database.

### Authentication & Authorization
The current implementation uses a simplified authentication system with wallet address-based user identification. The architecture supports future integration of more robust authentication mechanisms including:

- JWT token-based authentication
- Web3 wallet signature verification
- Session management with PostgreSQL session store

### Build & Deployment
The application uses a monorepo structure with shared TypeScript types and schemas. The build process involves:

- Frontend: Vite bundling with optimized production builds
- Backend: esbuild compilation for Node.js deployment
- Database: Drizzle migrations for schema management
- Development: Hot reload for both client and server code

The development environment includes Replit-specific optimizations for cloud-based development.

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database with connection via `DATABASE_URL` environment variable
- **Neon Database**: Serverless PostgreSQL provider for scalable database operations
- **Drizzle ORM**: Type-safe database operations with automatic migration support

### Blockchain Services
- **Intuition Testnet**: Ethereum-compatible blockchain network for DeFi operations
- **Ethers.js**: Web3 library for blockchain interactions and smart contract communication
- **Smart Contracts**: Custom farming pool contracts for staking and reward distribution

### UI/UX Libraries
- **Radix UI**: Headless UI component primitives for accessibility and functionality
- **shadcn/ui**: Pre-built component library with customizable design system
- **TailwindCSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation support

### Session & State Management
- **connect-pg-simple**: PostgreSQL session store for user sessions
- **Wouter**: Lightweight client-side routing
- **Zod**: Schema validation for API requests and responses

The platform is designed to be modular and extensible, allowing for easy integration of additional blockchain networks, alternative authentication methods, and expanded DeFi functionality.