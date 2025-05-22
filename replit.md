# Cloud Messenger Application Architecture Guide

## Overview
Cloud Messenger is a full-stack web application that enables users to create and manage virtual phone numbers for secure communication. The application allows users to:
- Create multiple virtual phone numbers for different purposes
- Add and manage contacts
- Send and receive messages through virtual numbers
- Switch between different virtual numbers as needed

The architecture follows a client-server model with a React frontend and an Express backend, using PostgreSQL for data storage via the Drizzle ORM.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: React Query for server state and local React state hooks
- **Routing**: wouter for lightweight client-side routing

### Backend
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth for user authentication
- **Database Access**: Drizzle ORM with NeonDB (PostgreSQL)
- **API**: RESTful API endpoints

### Database
- **Provider**: Ready for PostgreSQL via NeonDB serverless
- **Schema**: Managed through Drizzle ORM with defined schemas for users, virtual numbers, contacts, and messages
- **Session Management**: PostgreSQL session storage for Replit Auth

## Key Components

### Client-Side Components
1. **Page Components**
   - `Home`: Main application page (authenticated users)
   - `Landing`: Welcome page (unauthenticated users)

2. **Feature Components**
   - `Sidebar`: Navigation and virtual number management
   - `ChatView`: Message display and interaction
   - `ContactItem`: Individual contact display
   - `AddContactModal`: Form for adding new contacts
   - `NewNumberModal`: Form for creating new virtual numbers

3. **UI Components**
   - Extensive shadcn/ui component library (buttons, inputs, dialogs, etc.)
   - Custom components like `AvatarWithStatus` for enhanced UX

### Server-Side Components
1. **Express Server**
   - Entry point: `server/index.ts`
   - Route definitions in `server/routes.ts`
   - Authentication in `server/replitAuth.ts`

2. **Database Interaction**
   - Connection setup in `server/db.ts`
   - Storage interface in `server/storage.ts`

3. **Schemas**
   - Defined in `shared/schema.ts` (used by both client and server)

## Data Flow

1. **Authentication Flow**
   - User authentication via Replit Auth
   - Session management through PostgreSQL session storage
   - Protected routes for authenticated users

2. **Virtual Number Management**
   - Creation of virtual numbers
   - Setting default numbers for communication
   - Association with user accounts

3. **Messaging Flow**
   - Adding contacts to communicate with
   - Sending/receiving messages through virtual numbers
   - Real-time updates via polling

## External Dependencies

### Frontend Dependencies
- `@tanstack/react-query`: Data fetching and cache management
- `@radix-ui/*`: Accessible UI primitives used by shadcn/ui
- `wouter`: Client-side routing
- `date-fns`: Date manipulation and formatting
- `clsx` and `tailwind-merge`: Utility-first CSS management

### Backend Dependencies
- `express`: Web server framework
- `@neondatabase/serverless`: PostgreSQL database connectivity
- `drizzle-orm`: ORM for database interactions
- `openid-client` & `passport`: Authentication
- `connect-pg-simple`: Session storage
- `uuid`: Unique ID generation

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Development Mode**
   ```
   npm run dev
   ```
   - Runs the Express server with hot-reloading
   - Serves the Vite development server for frontend

2. **Production Build**
   ```
   npm run build
   ```
   - Builds the React frontend with Vite
   - Bundles the server with esbuild

3. **Production Start**
   ```
   npm run start
   ```
   - Runs the bundled application in production mode

4. **Database Migrations**
   ```
   npm run db:push
   ```
   - Updates the database schema using Drizzle Kit

## Getting Started

1. **Database Connection**
   - Make sure the PostgreSQL module is enabled in Replit
   - The `DATABASE_URL` environment variable should be automatically provisioned

2. **Environment Variables**
   - Ensure the following environment variables are set:
     - `DATABASE_URL`: PostgreSQL connection string
     - `SESSION_SECRET`: Secret for encrypting sessions
     - `REPLIT_DOMAINS`: Used for authentication

3. **Running the Application**
   - Use the Run button in Replit
   - The application will be available at the generated Replit URL

## Key Development Workflows

1. **Adding a New Feature**
   - Add server-side endpoints in `server/routes.ts`
   - Define any new schema entities in `shared/schema.ts`
   - Implement frontend components in `client/src/components`
   - Add hooks for data fetching in `client/src/hooks`

2. **Styling Guidelines**
   - Use Tailwind utility classes for styling
   - Maintain design consistency with the shadcn/ui component library
   - The theme is defined in `tailwind.config.ts` and `client/src/index.css`

3. **Authentication**
   - The application uses Replit Auth
   - Protected routes should use the `isAuthenticated` middleware
   - The user's ID is available via `req.user.claims.sub` in authenticated routes