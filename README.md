# 🐾 Pets Mart ERP

> A full-stack veterinary clinic & pet supply management system built with **React**, **Node.js/Express**, and **MySQL (Sequelize)**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup & Migrations](#database-setup--migrations)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Module Guide](#module-guide)

---

## Overview

Pets Mart ERP is a multi-role business management platform for a pet clinic and retail shop. It covers:

- 🛍️ **Inventory & Product Management** with image galleries
- 📅 **Appointment Booking** with doctor scheduling
- 🧾 **Invoice Generation** with automatic stock deduction
- 🎟️ **Coupon & Discount System** (flat & percentage)
- 💳 **Payment Tracking** (Cash / Online UPI with UTR)
- 📊 **Admin Dashboard** with real-time KPIs
- 🔐 **Multi-role Access Control** (Admin / Receptionist / Customer)
- 📋 **Audit Logging** for all critical actions
- 📦 **Stock History** per-product timeline

---

## ✨ Features

| Module | Highlights |
|---|---|
| **Dashboard** | Revenue trend, Invoice status chart, Payment split, Low-stock alerts, Recent invoices |
| **Products** | Image carousel, stock badges, stock history drawer, low-stock warnings |
| **Invoices** | Discount (flat/%), coupon codes, Cash/UPI payment, UTR tracking, print-ready PDF |
| **Coupons** | Create/Edit/Toggle flat & percentage discount codes with expiry dates |
| **Appointments** | Book with doctor & service, manage status |
| **Services** | Service catalog management |
| **Users** | Admin-only user management |
| **Audit Logs** | Searchable activity log for all system actions |

---

## 🛠 Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express 5 | ^5.2 | HTTP framework |
| Sequelize | ^6.37 | ORM for MySQL |
| MySQL2 | ^3.22 | Database driver |
| bcryptjs | ^3 | Password hashing |
| jsonwebtoken | ^9 | JWT auth |
| multer | ^2 | File uploads |
| zod | ^4 | Request validation |
| helmet | ^8 | Security headers |
| nodemon | ^3 | Dev hot-reload |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | ^18 | UI framework |
| Vite | latest | Build tool |
| React Router v6 | latest | Client routing |
| TanStack Query v5 | latest | Server state & caching |
| Axios | latest | HTTP client |
| Lucide React | latest | Icon library |
| Tailwind CSS | v3 | Utility styling |

---

## 📁 Project Structure

```
PET/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── couponController.js
│   │   ├── dashboardController.js
│   │   ├── invoiceController.js
│   │   ├── productController.js
│   │   ├── appointmentController.js
│   │   ├── generalController.js  # Services & Doctors
│   │   └── logController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authenticate + authorize
│   │   ├── upload.js             # Multer config
│   │   └── validate.js           # Zod validation middleware
│   ├── models/
│   │   ├── index.js              # Associations hub
│   │   ├── User.js
│   │   ├── Product.js / ProductImage.js
│   │   ├── Appointment.js
│   │   ├── Invoice.js / InvoiceItem.js
│   │   ├── Service.js / Doctor.js
│   │   ├── Coupon.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   └── index.js              # All API routes
│   ├── utils/
│   │   ├── schemas.js            # Zod validation schemas
│   │   ├── logger.js             # Activity log helper
│   │   └── catchAsync.js         # Async error wrapper
│   ├── uploads/                  # Uploaded product images
│   ├── migrate-invoices.js       # DB migration: Invoice columns
│   ├── migrate-invoice-items.js  # DB migration: InvoiceItem columns
│   ├── server.js                 # Express app entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Invoice/
    │   │   │   ├── InvoiceForm.jsx
    │   │   │   └── InvoiceDetailDrawer.jsx
    │   │   ├── Product/
    │   │   │   └── StockHistoryDrawer.jsx
    │   │   ├── Layout.jsx        # Sidebar + shell
    │   │   ├── Toast.jsx
    │   │   └── UI/               # Design system components
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Products.jsx
    │   │   ├── Invoices.jsx
    │   │   ├── Coupons.jsx
    │   │   ├── Appointments.jsx
    │   │   ├── Services.jsx
    │   │   ├── Users.jsx
    │   │   ├── Logs.jsx
    │   │   ├── PrintInvoice.jsx
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── api.js                # Axios instance with JWT interceptor
    │   ├── AuthContext.jsx
    │   └── App.jsx               # Router
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **MySQL** ≥ 5.7 (or MariaDB)
- **npm** ≥ 9

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd PET
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Run database migrations (first time only):

```bash
node migrate-invoices.js
node migrate-invoice-items.js
```

Start the backend:

```bash
# Development (hot-reload)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:3000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Environment Variables

Create `backend/.env` from `.env.example`:

```env
PORT=3000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=petMart_db
DB_DIALECT=mysql

# Auth
JWT_SECRET=your_super_secret_key_here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🗃 Database Setup & Migrations

Sequelize auto-syncs **new tables** on startup. For columns added to existing tables, run the migration scripts manually:

```bash
# Adds: discountAmount, discountType, couponCode, paymentMode, utrNumber to Invoices
node migrate-invoices.js

# Adds: serviceId to InvoiceItems
node migrate-invoice-items.js
```

> ⚠️ These scripts are safe to run multiple times — they skip columns that already exist.

---

## 📡 API Endpoints

All routes are prefixed with `/api/v1`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT cookie |
| POST | `/auth/logout` | Auth | Clear session |

### Products
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/products` | Public | List all products |
| POST | `/products` | Admin | Create product (multipart/form-data) |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| GET | `/products/:id/history` | Staff | Stock movement timeline |

### Invoices
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/invoices` | Staff | List all invoices |
| GET | `/invoices/:id` | Staff | Get single invoice |
| POST | `/invoices` | Staff | Create invoice + deduct stock |
| PUT | `/invoices/:id` | Staff | Update status (restores/re-deducts stock) |
| DELETE | `/invoices/:id` | Admin | Delete draft invoice + restore stock |

### Coupons
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/coupons` | Staff | List all coupons |
| POST | `/coupons` | Admin | Create coupon |
| PUT | `/coupons/:id` | Admin | Update coupon |
| DELETE | `/coupons/:id` | Admin | Delete coupon |
| POST | `/coupons/validate` | Staff | Validate coupon code for invoice |

### Appointments
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/appointments` | Auth | List appointments |
| POST | `/appointments` | Auth | Book appointment |
| PUT | `/appointments/:id` | Staff | Update appointment status |

### Other
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/services` | Public | List services |
| GET | `/doctors` | Public | List doctors |
| GET | `/dashboard/stats` | Staff | Full KPI data |
| GET | `/logs` | Admin | Audit activity log |

---

## 👥 User Roles

| Role | Access Level |
|---|---|
| **Admin** | Full access — all modules, user management, delete operations |
| **Receptionist** | Products, Appointments, Invoices, Coupons (view), Services |
| **Customer** | Appointments, Products (view only), Services |

---

## 📖 Module Guide

### 🧾 Creating an Invoice
1. Go to **Invoices** → **Create Invoice**
2. Add customer name and phone
3. Select products/services from the catalog (stock shown live)
4. Apply a flat or percentage **manual discount**, or enter a **coupon code**
5. Choose **Cash** or **Online/UPI** payment
6. For online: enter the **UTR reference number**
7. Save — stock is automatically deducted

### 🎟️ Creating a Coupon
1. Go to **Coupons** → **New Coupon**
2. Enter a unique code (e.g. `SAVE20`)
3. Choose **Flat (₹)** or **Percentage (%)**
4. Set optional minimum purchase amount and expiry date
5. Toggle Active/Paused as needed

### 📦 Stock History
- On the **Products** page, hover any product card
- Click the **🕐 (clock)** icon to open the Stock History drawer
- View a full timeline of all stock additions, deductions, and restorations

### 🖨️ Printing Invoices
- In the **Invoices** list, hover a row and click the **🖨 Printer** icon
- A print-ready page opens in a new tab with all line items, discount, payment details, and UTR

---

## 📝 License

This project is for internal business use at **Pets Mart**. All rights reserved.

---

<div align="center">
  <strong>🐾 Pets Mart ERP — Built with ❤️ for happy pets and efficient teams</strong>
</div>
