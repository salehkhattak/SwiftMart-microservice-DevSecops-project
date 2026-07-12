# Cart Service API Documentation

## Base URL

http://localhost:5004/api/cart

---

## Add Item To Cart

### Endpoint

POST /api/cart

### Request Body

```json
{
  "user_id": 1,
  "product_id": 1,
  "quantity": 2
}
```

### Success Response

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "quantity": 2
  }
}
```

---

## Get User Cart

### Endpoint

GET /api/cart/:userId

Example:

GET /api/cart/1

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

---

## Update Cart Item Quantity

### Endpoint

PUT /api/cart/:itemId

Example:

PUT /api/cart/1

### Request Body

```json
{
  "quantity": 5
}
```

### Success Response

```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    "id": 1,
    "quantity": 5
  }
}
```

---

## Delete Cart Item

### Endpoint

DELETE /api/cart/:itemId

Example:

DELETE /api/cart/1

### Success Response

```json
{
  "success": true,
  "message": "Cart item deleted"
}
```

---

## Clear User Cart

### Endpoint

DELETE /api/cart/user/:userId

Example:

DELETE /api/cart/user/1

### Success Response

```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Cart item not found"
}
```
