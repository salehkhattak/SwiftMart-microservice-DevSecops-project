# Notification Service

## Overview

The Notification Service manages notifications for the SwiftMart E-Commerce Platform.

This service is responsible for creating, storing, retrieving, and deleting notifications. During Phase 2, notifications are logged to the console and stored in PostgreSQL. In future phases, this service can be extended to support email, SMS, and push notifications.

---

## Features

* Create Notifications
* View All Notifications
* View Notification By ID
* Delete Notifications
* PostgreSQL Integration
* Console-Based Notification Logging

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

  * notificationController.js

* routes/

  * notificationRoutes.js

* services/

  * notificationService.js

* app.js

---

## API Endpoints

POST /api/notifications

GET /api/notifications

GET /api/notifications/:id

DELETE /api/notifications/:id

---

## Database Table

notifications

---

## Run Project

Install dependencies:

npm install

Start application:

npm run dev

---

## Service Port

5005

---

## Sample Notification

```json
{
  "user_id": 1,
  "type": "EMAIL",
  "message": "Your order has been placed successfully"
}
```

---

## Future Enhancements

* Email Notifications
* SMS Notifications
* Push Notifications
* Amazon SES Integration
* Event-Driven Architecture
* RabbitMQ / Amazon SQS

---

## Status

Notification Service Completed

Part of SwiftMart Cloud-Native Microservices E-Commerce Platform.

