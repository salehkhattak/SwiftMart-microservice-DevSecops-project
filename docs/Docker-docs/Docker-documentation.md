# Docker Documentation

## Overview

SwiftMart is a cloud-native electronics e-commerce platform built using a microservices architecture. The application has been containerized using Docker and orchestrated using Docker Compose.

The platform consists of:

* React Frontend
* Auth Service
* Product Service
* Order Service
* Cart Service
* Notification Service
* PostgreSQL Database

---

## Architecture

```
                 +----------------+
                 |     Frontend   |
                 |      React     |
                 +--------+-------+
                          |
                          |
 -------------------------------------------------
 |          Docker Compose Network               |
 -------------------------------------------------
      |          |         |         |         |
      |          |         |         |         |
 +----v----+ +---v----+ +--v----+ +--v----+ +--v------+
 | Auth    | |Product | |Order  | |Cart   | |Notification|
 | Service | |Service | |Service| |Service| |Service     |
 +----+----+ +---+----+ +---+---+ +---+---+ +------+-----+
      \           |          |         |            /
       \          |          |         |           /
        -------------------------------------------
                           |
                    +------v------+
                    | PostgreSQL  |
                    | swiftmart_db|
                    +-------------+
```

---

## Docker Components

### Frontend

* Framework: React + Vite
* Container Name:

```
swiftmart-frontend
```

* Port:

```
80
```

---

### Backend Services

### Auth Service

Port:

```
5001
```

Responsibilities:

* User registration
* Login
* JWT authentication
* Profile retrieval

---

### Product Service

Port:

```
5002
```

Responsibilities:

* Product management
* Category retrieval
* Product search

---

### Order Service

Port:

```
5003
```

Responsibilities:

* Create orders
* Order status updates
* Communication with Notification Service

---

### Cart Service

Port:

```
5004
```

Responsibilities:

* Add items to cart
* Update quantities
* Delete items
* Clear cart

---

### Notification Service

Port:

```
5005
```

Responsibilities:

* Store notifications
* Retrieve user notifications
* Delete notifications

---

### PostgreSQL

Image:

```
postgres:16
```

Database:

```
swiftmart_db
```

Port:

```
5432
```

Container Name:

```
swiftmart-postgres
```

---

## Docker Compose

The entire application is orchestrated using Docker Compose.

Services:

* postgres
* auth-service
* product-service
* order-service
* cart-service
* notification-service
* frontend

---

## Environment Variables

Each backend service uses a dedicated `.env.docker` file.

Example:

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=swiftmart_db
DB_USER=postgres
DB_PASSWORD=postgres
```

The service name `postgres` is used instead of `localhost` because containers communicate through the Docker network.

---

## Database Initialization

An `init.sql` file is mounted into PostgreSQL:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./init.sql:/docker-entrypoint-initdb.d/init.sql
```

The script automatically creates:

* users
* categories
* products
* orders
* order_items
* cart_items
* notifications

and inserts sample categories and products.

---

## Persistent Storage

Named volume:

```yaml
volumes:
  postgres_data:
```

ensures database persistence across container restarts.

---

## Inter-Service Communication

Services communicate using Docker DNS names.

Example:

```javascript
http://notification-service:5005/api/v1/notifications
```

rather than:

```javascript
http://localhost:5005
```

because localhost inside a container refers to the container itself.

---

## Build and Run

### Build Images

```bash
docker compose build
```

## Start Containers

```bash
docker compose up
```

or

```bash
docker compose up --build
```

### Run in Background

```bash
docker compose up -d
```

---

### Stop Containers

```bash
docker compose down
```

---

### Remove Containers and Volumes

```bash
docker compose down -v
```

---

### View Running Containers

```bash
docker ps
```

---

### Access PostgreSQL

```bash
docker exec -it swiftmart-postgres psql -U postgres -d swiftmart_db
```

List tables:

```sql
\dt
```

---

## Dockerized Microservices

| Service              | Port |
| -------------------- | ---- |
| Frontend             | 80   |
| Auth Service         | 5001 |
| Product Service      | 5002 |
| Order Service        | 5003 |
| Cart Service         | 5004 |
| Notification Service | 5005 |
| PostgreSQL           | 5432 |

---


## Screenshots

### Docker compose build
![](<screenshots/Docker compose build.png>)

### docker ps
![](<screenshots/docker ps.png>)

### docker compose up
![](<screenshots/docker compose up.png>)

## Current Status

Completed:

* Docker containerization
* Docker Compose orchestration
* PostgreSQL integration
* Persistent volumes
* Database initialization with init.sql
* Inter-service communication
* Full end-to-end functionality

---

## Next Phase

* API Gateway
* Redis caching
* Kubernetes
* Prometheus and Grafana
* CI/CD with GitHub Actions
* AWS deployment
