# Notification Service API Documentation

## Base URL

http://localhost:5005/api/notifications

---

## Create Notification

### Endpoint

POST /api/notifications

### Request Body

```json
{
  "user_id": 1,
  "type": "EMAIL",
  "message": "Your order has been placed successfully"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Notification created",
  "data": {
    "id": 1,
    "user_id": 1,
    "type": "EMAIL",
    "message": "Your order has been placed successfully",
    "status": "SENT"
  }
}
```

---

## Get All Notifications

### Endpoint

GET /api/notifications

### Success Response

```json
{
  "success": true,
  "data": []
}
```

---

## Get Notification By ID

### Endpoint

GET /api/notifications/:id.  // GET   http://localhost:5005/api/notifications/user/1

Example:

GET /api/notifications/1

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "type": "EMAIL",
    "message": "Your order has been placed successfully",
    "status": "SENT"
  }
}
```

---

## Delete Notification

### Endpoint

DELETE /api/notifications/:id

Example:

DELETE /api/notifications/1

### Success Response

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Notification not found"
}
```
