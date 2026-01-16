# Mobile Store E-commerce Project
First, if you want an overview for our project, click the link https://e-commerce-two-rho-64.vercel.app/
This is a full-stack e-commerce application built with React, Node.js, Express, and PostgreSQL.

## Project Structure

The project is divided into two main parts:
- **client**: The frontend application built with React and Vite.
- **server**: The backend REST API built with Node.js and Express.

## Technologies Used

### Frontend (`/client`)
- **Framework**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4), [Radix UI](https://www.radix-ui.com/)
- **State Management & Routing**: [React Router v7](https://reactrouter.com/), React Hook Form
- **Utilities**: Axios, Lucide React (Icons), Recharts, Sonner (Toasts)

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: [Express](https://expressjs.com/)
- **Database**: PostgreSQL (`pg`)
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens), BCrypt, Cookies
- **Additional Tools**:
  - `puppeteer`: For crawling data.
  - `nodemailer`: For sending emails.
  - `nodemon`: For development hot-reloading.

## API Routes
The backend exposes the following API endpoints (prefixed with `/api`):
- `/api/auth` - User authentication
- `/api/products` - Product management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order processing
- `/api/payment` - Payment handling
- `/api/admin` - Admin dashboard routes
- `/api/reviews` - Product reviews

## Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL installed and running
- Redis installed and running (optional, depending on config)
### 1. Setup Frontend
Navigate to the client directory:
```bash
$cd client
$npm install
```

Start the development server:
```bash
$npm run dev
```
Additional change (If u want a local be, need to change the env of in the client to link to your local host)
```bash
$code client/.env
```
Change the API_URL to your local host

### 2. Setup Backend
Navigate to the server directory:
```bash
$cd server
$npm install
```

Create a `.env` file in the `server` directory with the necessary environment variables (e.g., PORT, DATABASE_URL, JWT_SECRET, etc.).
```bash
Some essential env:
DATABASE_URL= your DB link (or u can custom with ur local DB)
REDIS_URL=your Redis URL
JWT_SECRET= the key for the token 
PORT=port for the BE local 
EMAIL_USER= Your email account u want to send gmail
EMAIL_PASS= Pass of the gmail application ( 16 digits )
CASSO_SECURE_TOKEN=your casso secure token
```
Start the server:
```bash
$npm run dev
```
The server will start at `http://localhost:5000` (or your configured port).


The application will be available at `http://localhost:5173`.

## Features
- **User Authentication**: Secure login and registration.
- **Product Browsing**: View products with sorting and filtering.
- **Shopping Cart**: Add items, adjust quantities.
- **Checkout & Payments**: Process orders.
- **Admin Dashboard**: Manage products and orders.
- **Reviews**: Users can leave reviews for products.
