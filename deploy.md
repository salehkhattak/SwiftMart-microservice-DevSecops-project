# SwiftMart Microservices Platform — Local Deployment Guide (No Docker)

> **OS:** Windows 10/11  
> **Shell:** PowerShell  
> **Node.js:** v22.x  
> **Database:** PostgreSQL 16  
> **Cache:** Redis 7  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [What Was Set Up (Setup Log)](#3-what-was-set-up-setup-log)
4. [Environment Files Created](#4-environment-files-created)
5. [Database Initialization](#5-database-initialization)
6. [How to Run the App](#6-how-to-run-the-app)
7. [Service URLs](#7-service-urls)
8. [Verification Status](#8-verification-status)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Architecture Overview

SwiftMart is a microservices-based e-commerce platform with the following services:

| Service               | Port | Technology        | Description                              |
|-----------------------|------|-------------------|------------------------------------------|
| `auth-service`        | 5001 | Node.js / Express | User registration, login, JWT tokens     |
| `product-service`     | 5002 | Node.js / Express | Product CRUD, Redis caching              |
| `order-service`       | 5003 | Node.js / Express | Order placement, AWS SNS notifications   |
| `cart-service`        | 5004 | Node.js / Express | Shopping cart management                 |
| `notification-service`| 5005 | Node.js / Express | AWS SQS consumer, notification storage   |
| `frontend`            | 5173 | React + Vite      | React SPA frontend                       |

**Shared infrastructure (local):**
- **PostgreSQL 16** on port `5432` — primary database for all services
- **Redis 7** on port `6379` — used by `product-service` for caching

---

## 2. Prerequisites

Make sure the following are installed on your machine:

| Tool           | Version Required | Check Command               | Download Link                                      |
|----------------|------------------|-----------------------------|---------------------------------------------------|
| Node.js        | v18+             | `node --version`            | https://nodejs.org/                               |
| npm            | v8+              | `npm --version`             | (bundled with Node.js)                            |
| PostgreSQL     | v14+             | `psql --version`            | https://www.postgresql.org/download/windows/      |
| Redis          | v6+              | `redis-cli --version`       | https://github.com/microsoftarchive/redis/releases |
| Git            | any              | `git --version`             | https://git-scm.com/                             |

> **Windows Redis Note:** Redis does not have an official Windows native build for v7. Use the **Memurai** (https://www.memurai.com/) alternative or the **Microsoft Redis** port from: https://github.com/microsoftarchive/redis/releases

---

## 3. What Was Set Up (Setup Log)

### 3.1 Verified Node.js & npm
```
node --version  →  v22.17.1
npm --version   →  10.9.2
```

### 3.2 Installed PostgreSQL 16 (via winget)
```powershell
& "$env:LOCALAPPDATA\Microsoft\WindowsApps\winget.exe" install `
    --id PostgreSQL.PostgreSQL.16 `
    --silent `
    --accept-package-agreements `
    --accept-source-agreements
```
- Installer: `postgresql-16.14-2-windows-x64.exe`
- Default superuser: `postgres`
- Default password set: `postgres`
- Default port: `5432`
- Service auto-starts as: `postgresql-x64-16`

### 3.3 Installed Redis for Windows (via Memurai / winget)
```powershell
& "$env:LOCALAPPDATA\Microsoft\WindowsApps\winget.exe" install `
    --id Memurai.Memurai-Developer `
    --silent `
    --accept-package-agreements `
    --accept-source-agreements
```
- Runs on port `6379` (compatible with all Redis clients)

### 3.4 Created Local `.env` Files for All Services
All services originally had `.env.docker` files pointing to Docker service names (`postgres`, `redis`).  
We created new `.env` files in each service directory pointing to `localhost` for local development.

| Service                | .env file created                               |
|------------------------|-------------------------------------------------|
| auth-service           | `services/auth-service/.env`                   |
| product-service        | `services/product-service/.env`                |
| order-service          | `services/order-service/.env`                  |
| cart-service           | `services/cart-service/.env`                   |
| notification-service   | `services/notification-service/.env`           |
| frontend               | `frontend/.env`                                |

### 3.5 Installed npm Dependencies for All Services

```powershell
cd services/auth-service         && npm install   # ✅ 128 packages
cd services/product-service      && npm install   # ✅ 121 packages
cd services/order-service        && npm install   # ✅ 159 packages
cd services/cart-service         && npm install   # ✅ 114 packages
cd services/notification-service && npm install   # ✅ 147 packages
cd frontend                      && npm install   # ✅ 166 packages
```

### 3.6 Initialized the Database

```powershell
# Set postgres bin on PATH
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# Create the database
createdb -U postgres swiftmart_db

# Run the schema + seed SQL
psql -U postgres -d swiftmart_db -f init.sql
```
- Creates tables: `users`, `categories`, `products`, `orders`, `order_items`, `cart_items`, `notifications`
- Seeds sample categories: Laptops, Accessories, Storage, Networking, Audio
- Seeds 5 sample products

---

## 4. Environment Files Created

### `services/auth-service/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftmart_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5001
JWT_SECRET=swiftmart_secret_key
```

### `services/product-service/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftmart_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5002
REDIS_URL=redis://localhost:6379
```

### `services/order-service/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftmart_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5003
JWT_SECRET=swiftmart_secret_key
INTERNAL_SERVICE_TOKEN=swiftmart_internal_token
```

### `services/cart-service/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftmart_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5004
JWT_SECRET=swiftmart_secret_key
```

### `services/notification-service/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftmart_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5005
JWT_SECRET=swiftmart_secret_key
INTERNAL_SERVICE_TOKEN=swiftmart_internal_token
```

### `frontend/.env`
```env
VITE_AUTH_API_URL=http://localhost:5001/api/v1/auth
VITE_PRODUCT_API_URL=http://localhost:5002/api/v1/products
VITE_ORDER_API_URL=http://localhost:5003/api/v1/orders
VITE_CART_API_URL=http://localhost:5004/api/v1/cart
VITE_NOTIFICATION_API_URL=http://localhost:5005/api/notifications
```

---

## 5. Database Initialization

After PostgreSQL is installed and running, initialize the database **once**:

```powershell
# 1. Add PostgreSQL to PATH (adjust version if different)
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# 2. Create the database (enter password 'postgres' when prompted)
createdb -U postgres swiftmart_db

# 3. Run the schema and seed data
psql -U postgres -d swiftmart_db -f init.sql
```

To verify tables were created:
```powershell
psql -U postgres -d swiftmart_db -c "\dt"
```

Expected output: `users`, `categories`, `products`, `orders`, `order_items`, `cart_items`, `notifications`

---

## 6. How to Run the App

Open **7 separate PowerShell terminal windows** (or use Windows Terminal with tabs).

### Step 1 — Start PostgreSQL Service
```powershell
# Check if already running
Get-Service -Name "postgresql-x64-16"

# If not running, start it (requires admin)
Start-Service -Name "postgresql-x64-16"
```

### Step 2 — Start Redis (Memurai)
```powershell
# Check if Memurai is running
Get-Service -Name "Memurai"

# Start if not running (requires admin)
Start-Service -Name "Memurai"

# OR run Redis manually (portable)
redis-server
```

### Step 3 — Start auth-service (Terminal 1)
```powershell
cd "d:\devops projects\e-commerce-project\swiftmart-microservices-platform\services\auth-service"
npm run dev
# → Listening on http://localhost:5001
```

### Step 4 — Start product-service (Terminal 2)
```powershell
cd "d:\devops projects\e-commerce-project\swiftmart-microservices-platform\services\product-service"
npm run dev
# → Listening on http://localhost:5002
```

### Step 5 — Start order-service (Terminal 3)
```powershell
cd "d:\devops projects\e-commerce-project\swiftmart-microservices-platform\services\order-service"
npm run dev
# → Listening on http://localhost:5003
```

### Step 6 — Start cart-service (Terminal 4)
```powershell
cd "d:\devops projects\e-commerce-project\swiftmart-microservices-platform\services\cart-service"
npm run dev
# → Listening on http://localhost:5004
```

### Step 7 — Start notification-service (Terminal 5)
```powershell
cd "d:\devops projects\e-commerce-project\swiftmart-microservices-platform\services\notification-service"
npm run dev
# → Listening on http://localhost:5005
```

### Step 8 — Start frontend (Terminal 6)
```powershell
cd "d:\devops projects\e-commerce-project\swiftmart-microservices-platform\frontend"
npm run dev
# → Frontend available at http://localhost:5173
```

---

## 7. Service URLs

| Service               | URL                                          |
|-----------------------|----------------------------------------------|
| Frontend (React)      | http://localhost:5173                        |
| Auth API              | http://localhost:5001/api/v1/auth            |
| Product API           | http://localhost:5002/api/v1/products        |
| Order API             | http://localhost:5003/api/v1/orders          |
| Cart API              | http://localhost:5004/api/v1/cart            |
| Notification API      | http://localhost:5005/api/notifications      |
| Auth Health/Metrics   | http://localhost:5001/metrics                |
| Product Health/Metrics| http://localhost:5002/metrics                |

---

## 8. Verification Status

We verified that the entire platform is successfully running locally (no Docker):

| Service | Port | Local Process Status | Health Check Verification |
|---|---|---|---|
| `auth-service` | `5001` | Active (PID 4392) | ✅ `OK` |
| `product-service` | `5002` | Active (PID 6008) | ✅ `OK` |
| `order-service` | `5003` | Active (PID 8744) | ✅ `OK` |
| `cart-service` | `5004` | Active (PID 16400) | ✅ `OK` |
| `notification-service` | `5005` | Active (PID 15112) | ✅ `OK` |
| `frontend` | `5173` | Active (PID 14968) | ✅ `OK` |

*Health verification was successfully completed via local curl requests to `/health` on all services.*

---

## 9. Troubleshooting

### ❌ `ECONNREFUSED` when connecting to PostgreSQL
- Make sure the `postgresql-x64-16` Windows service is **Running**.
- Check with: `Get-Service -Name "postgresql-x64-16"`
- Start it with (admin PowerShell): `Start-Service -Name "postgresql-x64-16"`

### ❌ `ECONNREFUSED` when connecting to Redis
- Make sure Redis/Memurai service is **Running**.
- Check with: `Get-Service -Name "Memurai"`
- Or run `redis-server` manually in a terminal.

### ❌ `database "swiftmart_db" does not exist`
- Run the database initialization commands from [Section 5](#5-database-initialization).

### ❌ `JWT_SECRET` / auth errors between services
- Make sure all `.env` files have the same `JWT_SECRET=swiftmart_secret_key`.
- Restart the affected service after changing `.env`.

### ❌ AWS SDK errors (SNS/SQS) in order-service / notification-service
- The `order-service` uses **AWS SNS** and `notification-service` uses **AWS SQS**.
- For local testing without AWS, these features will fail gracefully — the core order/notification flows will still work for DB operations.
- To enable AWS features locally, add to the relevant `.env`:
  ```env
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your_key
  AWS_SECRET_ACCESS_KEY=your_secret
  ```

### ❌ Port already in use
```powershell
# Find what is using a port (e.g., 5001)
netstat -ano | findstr ":5001"
# Kill the process by PID
taskkill /PID <PID> /F
```

### ❌ `nodemon` not found
```powershell
# Install nodemon globally
npm install -g nodemon
```

---

## Quick Start Summary

```powershell
# 1. Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"

# 2. Initialize DB (first time only)
createdb -U postgres swiftmart_db
psql -U postgres -d swiftmart_db -f init.sql

# 3. Start all backend services (each in its own terminal)
cd services/auth-service         ; npm run dev   # :5001
cd services/product-service      ; npm run dev   # :5002
cd services/order-service        ; npm run dev   # :5003
cd services/cart-service         ; npm run dev   # :5004
cd services/notification-service ; npm run dev   # :5005

# 4. Start frontend
cd frontend                      ; npm run dev   # :5173
```

Open your browser at **http://localhost:5173** 🚀
