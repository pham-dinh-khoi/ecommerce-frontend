# Ecommerce Frontend

A responsive ecommerce web application built with React, TypeScript, Redux Toolkit, and Tailwind CSS. It provides complete customer shopping flows and a role-protected administration interface backed by a Node.js REST API.

> Backend repository: [ecommerce-backend](https://github.com/pham-dinh-khoi/ecommerce-backend)

## Key Frontend Highlights

- **Seamless guest cart** — anonymous visitors receive a persistent guest ID, and their Redis-backed cart is merged into the authenticated cart after login.
- **Centralized session recovery** — Axios interceptors attach access tokens, coordinate refresh requests, retry failed requests, and redirect safely when a session expires.
- **Feature-oriented architecture** — each business domain owns its Redux slice, API service, components, and related logic.
- **Variant-aware shopping** — product options are matched against valid SKU combinations with inventory and pricing feedback.
- **Faceted discovery** — keyword search, autocomplete, category browsing, filters, sorting, trending products, and similar products.
- **Multi-step product management** — administrators create product information, variants, and media through a three-step workflow.
- **Typed forms and validation** — React Hook Form and Zod provide consistent client-side validation and error messages.

## Tech Stack

| Area | Technologies |
| --- | --- |
| UI | React 19, TypeScript |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| State | Redux Toolkit, React Redux, Redux Persist |
| HTTP | Axios |
| Forms | React Hook Form, Zod |
| Styling | Tailwind CSS 4 |
| Components | Base UI, Shadcn, Lucide React, Sonner |
| Testing | Vitest, jsdom |
| Deployment | Docker, Nginx, Vercel |

## Features

### Customer experience

- Home page with category and product discovery
- Hierarchical category browsing
- Product listing, details, images, and variant selection
- Keyword search with autocomplete
- Brand, price, and rating filters
- Sorting and pagination
- Trending and similar-product recommendations
- Responsive desktop and mobile navigation
- Loading skeletons, empty states, and API error feedback

### Account and profile

- Registration and login
- Email verification
- Forgot-password and reset-password flows
- Automatic access-token refresh
- User profile and avatar management
- Password changes
- Address book with province, district, and ward selectors
- Protected customer routes

### Shopping and checkout

- Guest and authenticated carts
- Quantity updates and item removal
- Wishlist management
- Coupon preview and discount feedback
- Address selection during checkout
- Cash on delivery and PayPal
- Payment success, failure, and cancellation results
- Customer order history, details, status timeline, and cancellation

### Reviews

- Product rating summaries
- Review creation and editing
- Review image uploads
- Helpful votes
- Verified-purchase indicators
- Seller replies and moderation status

### Administration

- Role-protected admin routes
- Hierarchical category management
- Three-step product creation wizard
- Product, variant, inventory, and image management
- Product archive and permanent deletion
- User management
- Coupon management
- Order filtering, details, statistics, and status transitions
- Review moderation

## Application Architecture

```text
Page / Feature Component
        |
        v
Redux Async Thunk
        |
        v
Feature Service
        |
        v
Axios Instance -> Backend REST API
        |
        +-- Attach access token
        +-- Attach X-Guest-Id
        +-- Refresh expired session
        +-- Normalize API errors
```

### Authentication lifecycle

At application startup:

```text
Application starts
      |
      +-- Try refresh-token request
      |       |
      |       +-- Success: load current user and wishlist
      |       +-- Failure: create or preserve a guest ID
      |
      v
Render application routes
```

The access token is held in application state. The refresh token is managed by the backend through an HTTP-only cookie. Concurrent requests that receive `401` responses share one refresh operation before being retried.

### Guest cart lifecycle

```text
Anonymous visitor -> guest ID in localStorage -> X-Guest-Id header
    -> Redis guest cart -> login -> backend cart merge -> remove guest ID
```

### State management

Redux Toolkit slices are organized by business domain:

- Authentication
- Categories
- Products
- Users
- Cart
- Wishlist
- Coupons
- Orders
- Reviews

Redux Persist stores selected application state while excluding authentication and category state that should be refreshed from the server.

## Project Structure

```text
src/
├── assets/          # Static application images
├── components/
│   ├── common/      # Reusable application components
│   ├── layout/      # Customer, authentication, and admin layouts
│   └── ui/          # Base UI and Shadcn components
├── constants/       # Route names, API endpoints, error messages
├── features/        # Domain services, slices, components, and utilities
├── hooks/           # Shared React hooks
├── lib/             # Navigation, guest ID, pending-order helpers
├── pages/           # Public, customer, and admin pages
├── routes/          # Public, protected, and admin route configuration
├── services/        # Axios configuration and external data services
├── store/           # Redux store and typed hooks
├── types/           # API and domain types
├── utils/           # Error and formatting utilities
├── App.tsx          # Application initialization
└── main.tsx         # React entry point
```

## Main Routes

### Public routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/login` | Login |
| `/register` | Registration |
| `/forgot-password` | Password recovery request |
| `/reset-password` | Password reset |
| `/verify-email` | Email verification result |
| `/category/:slug` | Category products |
| `/product/:slug` | Product details |
| `/search` | Search results |
| `/cart` | Shopping cart |
| `/payment/result` | Payment result |

### Authenticated routes

| Route | Description |
| --- | --- |
| `/profile` | Profile, security, and addresses |
| `/wishlist` | Saved products |
| `/checkout` | Checkout |
| `/orders` | Customer orders |
| `/orders/:orderCode` | Order details and timeline |

### Admin routes

| Area | Routes |
| --- | --- |
| Categories | `/admin/categories/*` |
| Products | `/admin/products/*` |
| Users | `/admin/users` |
| Coupons | `/admin/coupons/*` |
| Orders | `/admin/orders/*` |
| Reviews | `/admin/reviews` |

Admin routes require an authenticated user whose role is `admin`. Authorization is also enforced independently by the backend.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A running [ecommerce backend](https://github.com/pham-dinh-khoi/ecommerce-backend)

### Installation

```bash
git clone https://github.com/pham-dinh-khoi/ecommerce-frontend.git
cd ecommerce-frontend
npm ci
cp .env.example .env
```

Configure the backend URL in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Full base URL of the backend API, including the `/api` prefix |

Only variables prefixed with `VITE_` are exposed to browser code. Never place private keys or server secrets in the frontend environment file.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check the project with ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run the test suite once |

## Testing

```bash
npm run test:run
```

The current tests cover shared error handling, currency formatting, and product-variant matching. Authentication, route guards, Redux slices, cart merging, checkout, and payment flows remain priority areas for broader test coverage.

## Production Build

```bash
npm run build
npm run preview
```

The repository includes:

- A multi-stage Docker build
- Nginx configuration for serving the SPA
- Vercel rewrite configuration for client-side routes

Build and run the container:

```bash
docker build -t ecommerce-frontend .
docker run --rm -p 8080:80 ecommerce-frontend
```

Open `http://localhost:8080`.

## Quality Checks

```bash
npm run lint
npm run test:run
npm run build
```

The production build currently reports a large JavaScript chunk warning. Route-level lazy loading and further code splitting are planned performance improvements.

## Current Limitations

- Limited automated coverage for components, routes, Redux state, and end-to-end flows
- Main application routes are imported eagerly instead of being lazy-loaded
- The initial production JavaScript bundle exceeds Vite's 500 kB warning threshold
- The not-found route currently uses a minimal fallback UI
- Live demo and screenshots are not yet included in this README

## Related Repository

The backend API, database models, authentication, Redis cart, order transactions, and PayPal webhook handling are available in [ecommerce-backend](https://github.com/pham-dinh-khoi/ecommerce-backend).

## License

No license is currently declared in `package.json`. Add a repository license before distributing or reusing the project outside its portfolio context.
