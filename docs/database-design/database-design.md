# SwiftMart Database Design

### Overview

SwiftMart is a production-grade cloud-native electronics e-commerce platform.

The database is built using PostgreSQL and stores:

* Users
* Categories
* Products
* Orders
* Order Items

⸻

## Database

Database Name:

swiftmart_db

⸻

## Tables

### users

Stores customer and administrator accounts.

Fields:

* id
* name
* email
* password_hash
* role
* created_at

⸻

### categories

Stores product categories.

Examples:

* Laptops
* Accessories
* Storage
* Networking
* Audio

⸻

### products

Stores product catalog information.

Fields:

* id
* name
* description
* price
* stock_quantity
* image_url
* category_id

⸻

### orders

Stores customer orders.

Fields:

* id
* user_id
* total_amount
* status
* created_at

⸻

### order_items

Stores products belonging to orders.

Fields:

* id
* order_id
* product_id
* quantity
* price

⸻

## Relationships

Category → Products

User → Orders

Order → Order Items

Product → Order Items

⸻

## Sample Products

* Dell XPS 15
* Logitech MX Master 3
* Samsung T7 SSD
* TP-Link Archer AX55
* Sony WH-1000XM6

⸻

## Learning Outcomes

* Database normalization
* Primary keys
* Foreign keys
* One-to-many relationships
* SQL joins
* PostgreSQL database design
