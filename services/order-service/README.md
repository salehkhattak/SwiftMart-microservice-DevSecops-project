# Order Service

## Overview

The Order Service is responsible for managing customer orders in the SwiftMart E-Commerce Platform.

---

## Features

* Create Orders
* View All Orders
* View Single Order
* Update Order Status
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
* controllers/
* routes/
* services/
* app.js

---

## API Endpoints

POST /api/orders

GET /api/orders

GET /api/orders/:id

PUT /api/orders/:id/status

---

## Run Project

Install dependencies:

npm install

Run application:

npm run dev

---

## Database Tables

orders

order_items

---

## Status

Order Service Completed
