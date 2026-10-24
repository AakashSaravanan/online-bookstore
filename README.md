# Online Bookstore — MERN Stack E-Commerce Platform

A full-stack online bookstore built with the MERN stack, featuring book discovery, secure authentication, shopping cart management, checkout, order tracking, and an administrative dashboard for managing books, inventory, and orders.

**Live Demo:** [Visit the Online Bookstore](https://online-bookstore-gray.vercel.app/)

**Backend API:** [Online Bookstore API](https://online-bookstore-api-0mro.onrender.com/)

## Features

### Customer Features
- **User Authentication:** Register and log in using JWT-based authentication and bcrypt password hashing.
- **Book Catalogue:** Browse books and view individual book details.
- **Search and Filtering:** Search books by title or author and filter by category.
- **Shopping Cart:** Add books, update quantities, and remove items.
- **Checkout:** Submit shipping information and place orders.
- **Order Confirmation:** View confirmation after placing an order.
- **Order History:** View personal orders and track their status.
- **Protected Routes:** Restrict cart, checkout, and order history to authenticated users.

### Admin Features
- **Book Management:** Create, edit, and delete books.
- **Inventory Management:** Update stock quantities.
- **Order Management:** View customer orders and update order statuses.
- **Role-Based Access Control:** Restrict administrative pages and API endpoints to authorized administrators.

### Backend and Data Integrity
- **MongoDB Integration:** Store users, books, and orders using Mongoose.
- **Server-Side Price Validation:** Calculate order totals using book prices stored in the database.
- **Inventory Validation:** Check available stock before confirming an order.
- **Database Transactions:** Update stock and create orders within a transaction.
- **Cancellation Handling:** Restore reserved inventory when an order is cancelled.
- **Customer Data Isolation:** Return only the authenticated customer's orders through the personal order-history endpoint.
- **CORS Configuration:** Allow requests from configured frontend origins.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, React Router, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| API Testing | Postman |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git, GitHub |

## Architecture

The application uses a client-server architecture. The React frontend communicates with the Express REST API, which handles authentication, business logic, database operations, and access control.

```text
Online-bookstore/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── BookCard.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Books.jsx
│       │   ├── BookDetails.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── OrderConfirmation.jsx
│       │   ├── MyOrders.jsx
│       │   ├── Admin.jsx
│       │   └── AdminOrders.jsx
│       ├── utils/
│       │   └── cart.js
│       ├── api.js
│       └── App.jsx
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   └── orderRoutes.js
│   └── server.js
│
├── .gitignore
└── README.md
```

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

Install or prepare the following:

- Node.js and npm
- Git
- A MongoDB Atlas database or another MongoDB deployment that supports transactions
- A code editor such as Visual Studio Code
- Postman (optional, for API testing)

### 1. Clone the Repository

```bash
git clone https://github.com/AakashSaravanan/online-bookstore.git
cd online-bookstore
```

### 2. Configure the Backend

Open a terminal in the project root and run:

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Replace the placeholder values with your own configuration. Do not commit this file or publish your credentials.

**Environment variables**

| Variable | Purpose |
|---|---|
| `PORT` | Port on which the backend listens; defaults to `5000`. |
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify JWTs. |
| `CLIENT_URL` | Allowed frontend origin or comma-separated list of origins. |

Start the backend:

```bash
npm run dev
```

The API should start on `http://localhost:5000` after successfully connecting to MongoDB.

The root endpoint can be checked at:

[http://localhost:5000/](http://localhost:5000/)

Expected response:

```text
Online Bookstore API is running
```

> **Database note:** Order creation and cancellation use MongoDB transactions. Use MongoDB Atlas or another MongoDB deployment configured as a replica set that supports transactions.

### 3. Configure the Frontend

Open a **second terminal** in the project root:

```bash
cd client
npm install
```

Create a `.env.local` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000
```

This variable tells the frontend where to find the backend API.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

[http://localhost:5173](http://localhost:5173)

The frontend and backend must both be running for the complete application to work.

### 4. Set Up an Administrator

Newly registered accounts receive the `user` role by default.

To access administrative features, configure an administrator account through a secure database or administrative provisioning process. Do not expose an administrator-creation mechanism publicly or store database credentials in frontend code.

## API Documentation

**Base URL — local development:** `http://localhost:5000`

**Base URL — production:** `https://online-bookstore-api-0mro.onrender.com`

Protected endpoints require a valid JWT in the request header:

```http
Authorization: Bearer <your_jwt_token>
```

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a customer account |
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| GET | `/api/auth/profile` | Authenticated | Retrieve the current token's user information |

### Books — `/api/books`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/books` | Public | Retrieve books |
| GET | `/api/books/:id` | Public | Retrieve a book by ID |
| POST | `/api/books` | Admin | Create a book |
| PUT | `/api/books/:id` | Admin | Update a book |
| DELETE | `/api/books/:id` | Admin | Delete a book |
| PATCH | `/api/books/:id/stock` | Admin | Adjust inventory |

The catalogue endpoint supports search and category filtering:

```http
GET /api/books?search=Hobbit
GET /api/books?category=Fantasy
GET /api/books?search=Hobbit&category=Fantasy
```

The stock-adjustment endpoint accepts a quantity change:

```json
{
  "quantity": 5
}
```

A positive quantity adds stock; a negative quantity subtracts stock, provided sufficient inventory remains.

### Orders — `/api/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Authenticated | Create an order |
| GET | `/api/orders/my-orders` | Authenticated | Retrieve the current customer's orders |
| GET | `/api/orders/admin` | Admin | Retrieve all orders |
| PATCH | `/api/orders/admin/:id/status` | Admin | Update an order's status |

The order creation endpoint expects book IDs and quantities along with shipping details. Prices and totals are calculated by the backend.

Example request structure:

```json
{
  "items": [
    {
      "book": "YOUR_BOOK_ID",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "Example Customer",
    "email": "customer@example.com",
    "phone": "9876543210",
    "address": "123 Example Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001"
  }
}
```

Available order statuses:

- `Processing`
- `Confirmed`
- `Shipped`
- `Delivered`
- `Cancelled`

Order status transitions are validated by the backend. Cancelling an eligible order restores its reserved stock within a database transaction.

## Available Scripts

### Frontend

Run these commands from the `client/` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production frontend |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

### Backend

Run these commands from the `server/` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the backend with Node.js watch mode |
| `npm start` | Start the backend normally |

## Deployment

The project is deployed using separate frontend and backend services.

- **Frontend:** [Vercel deployment](https://online-bookstore-gray.vercel.app/)
- **Backend:** [Render deployment](https://online-bookstore-api-0mro.onrender.com/)

For your own deployment:

1. Deploy the backend and configure `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and any required `PORT` setting.
2. Set `CLIENT_URL` to the deployed frontend origin. Include additional trusted origins as a comma-separated list if required.
3. Deploy the frontend and set `VITE_API_URL` to the backend base URL.
4. Ensure the MongoDB deployment supports the transactions used by order processing.
5. Verify the frontend-to-backend connection, authentication, book operations, checkout, and order management after deployment.

Frontend environment variables are embedded during the build, so configure `VITE_API_URL` in the frontend hosting environment before building or redeploying.

## Testing and Verification

The application has been manually tested against the deployed environment for its core workflows, including:

- Customer registration and login.
- Book browsing, search, category filtering, and details.
- Cart quantity updates and item removal.
- Checkout, order creation, and inventory updates.
- Customer-specific order history.
- Admin book and inventory management.
- Admin order-status updates.
- Customer and administrator route access restrictions.

These are manual workflow checks, not a claim of automated test-suite coverage.

## Security Considerations

- Passwords are hashed using bcrypt before storage.
- JWT-protected endpoints verify the token using the server-side secret.
- Administrative endpoints enforce role-based authorization.
- Order prices are calculated from database records rather than trusted from the frontend.
- Order creation and cancellation use transactions to keep order and inventory changes consistent.
- Environment files and secrets must remain outside version control.

## Future Improvements

Potential enhancements include:

- Automated unit and integration tests.
- Payment gateway integration.
- Pagination and more advanced catalogue filtering.
- Book reviews, ratings, and wishlists.
- Email notifications for order updates.
- Improved monitoring and error reporting.

## Author

**Aakash Saravanan**

[GitHub Profile](https://github.com/AakashSaravanan)

---

*Built as a full-stack portfolio project to demonstrate React development, REST API design, database modeling, authentication, authorization, inventory management, and deployment.*
