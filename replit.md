# SmartCare Cleaning Solutions

## Overview

SmartCare Cleaning Solutions is a modern, responsive service-commerce website for a professional cleaning services company based in Vijayawada, India. The application provides:

- **Service Booking**: Home cleaning, office cleaning, sofa/carpet cleaning, and bathroom sanitization services
- **E-commerce Store**: Housekeeping products including disinfectants, phenyl, floor cleaners, and cleaning tools
- **User Authentication**: Email/password authentication via Supabase
- **Contact System**: Customer inquiry submission

The tech stack combines a React frontend with an Express backend, using Supabase for authentication and database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite

The frontend follows a component-based architecture with:
- `pages/` - Route-level components (Home, Services, Products, Cart, Login, etc.)
- `components/sections/` - Page section components (Hero, Services, Products, Testimonials)
- `components/layout/` - Layout components (Navbar, Footer)
- `components/ui/` - Reusable shadcn/ui primitives
- `contexts/` - React Context providers (AuthContext)
- `lib/` - Utilities, constants, and API clients

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: In-memory storage (MemStorage class)
- **API Design**: RESTful endpoints under `/api/` prefix

Key backend files:
- `server/routes.ts` - API route definitions
- `server/supabase.ts` - Supabase client initialization
- `server/storage.ts` - User storage interface (currently in-memory)
- `server/security/` - Security middleware and utilities
- `shared/schema.ts` - Drizzle database schema definitions

### Security Architecture
The application implements enterprise-grade security measures:

**Authentication & Authorization:**
- `verifyToken` - JWT validation for authenticated routes
- `verifyAdmin` - Admin-only access (restricted to smartcarecleaningsolutions@gmail.com)
- `verifyUserOwnership` - IDOR prevention for user-specific resources

**Rate Limiting:**
- `authLimiter` - 10 requests per 15 minutes on auth endpoints
- `otpLimiter` - 5 OTP requests per hour
- `strictLimiter` - 10 requests per minute on sensitive endpoints
- `adminLimiter` - 60 requests per minute for admin operations

**Input Validation:**
- Zod schema validation on all API inputs
- UUID validation for all ID parameters
- Phone/email format validation
- Request body sanitization (XSS prevention)

**Security Headers (Production):**
- Helmet middleware with CSP, HSTS, X-Frame-Options
- Strict CORS with origin whitelist
- Request size limits (500KB)

**Audit Logging:**
- Structured logging for auth events, admin actions, security incidents
- Severity-based classification (INFO/WARNING/CRITICAL)
- IP masking for privacy compliance

### Authentication Flow
- Supabase Auth handles user registration and login
- Client fetches Supabase config from `/api/config` endpoint
- AuthContext provides authentication state throughout the app
- Supports email/password authentication

### Data Flow
1. Frontend components fetch data via React Query
2. API requests go to Express backend endpoints
3. Backend queries Supabase for products, services, and bookings
4. Responses flow back through React Query cache

## External Dependencies

### Supabase Integration
- **Purpose**: Authentication and database storage
- **Tables**: products, services, bookings, contacts
- **Environment Variables Required**:
  - `SUPABASE_URL` - Supabase project URL
  - `SUPABASE_ANON_KEY` - Supabase anonymous/public key

### PostgreSQL Database
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts`
- **Environment Variable**: `DATABASE_URL`
- **Current Schema**: Users table with id, username, password fields

### Third-Party UI Libraries
- Radix UI primitives for accessible components
- Lucide React for icons
- Embla Carousel for product carousels
- cmdk for command palette functionality

### Build & Development
- Vite for frontend development and bundling
- esbuild for server-side bundling
- TypeScript for type safety across the stack