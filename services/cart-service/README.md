# Cart Service

## Overview

The Cart Service manages shopping cart operations for the SwiftMart E-Commerce Platform.

Users can add products to their cart, update quantities, remove items, and clear their cart before placing an order.

---

## Features

* Add Product To Cart
* View User Cart
* Update Cart Quantity
* Delete Cart Item
* Clear Entire Cart
* PostgreSQL Integration

---

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* pg
* dotenv
* cors

---

## Project Structure

src/

* config/

  * db.js

* controllers/

  * cartController.js

* routes/

  * cartRoutes.js

* services/

  * cartService.js

* app.js

---

## API Endpoints

POST /api/cart

GET /api/cart/:userId

PUT /api/cart/:itemId

DELETE /api/cart/:itemId

DELETE /api/cart/user/:userId

---

## Database Table

cart_items

---

## Run Project

Install dependencies:

npm install

Start application:

npm run dev

---

## Service Port

5004

---

## Status

Cart Service Completed

Part of SwiftMart Cloud-Native Microservices E-Commerce Platform.
