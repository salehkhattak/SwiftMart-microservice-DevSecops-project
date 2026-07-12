# Order Service API Documentation

## Base URL

http://localhost:5003/api/orders

---

## Create Order

### Endpoint

POST /api/orders

### Request Body

```json
{
  "user_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 1899.99
    },
    {
      "product_id": 2,
      "quantity": 1,
      "price": 99.99
    }
  ]
}
```

### Success Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "total_amount": 3899.97,
    "status": "PENDING"
  }
}
```

---

## Get All Orders

### Endpoint

GET /api/orders

### Success Response

```json
{
  "success": true,
  "data": []
}
```

---

## Get Order By ID

### Endpoint

GET /api/orders/:id

Example:

GET /api/orders/1

### Success Response

```json
{
  "success": true,
  "data": {
    "order": {},
    "items": []
  }
}
```

---

## Update Order Status

### Endpoint

PUT /api/orders/:id/status

### Request Body

```json
{
  "status": "SHIPPED"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Order status updated"
}
```
