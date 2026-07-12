### Product Service
http://localhost:5002/api/products

### Get All Products
 GET /api/products

Response
<!-- {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dell XPS 15",
      "description": "Developer Laptop",
      "price": 1899.99,
      "stock_quantity": 20,
      "category": "Laptops"
    }
  ]
} -->

### Search Products
GET /api/products?search=dell

### Filter By Category
GET /api/products?category=1

### Get Product By ID
GET /api/products/1

### Create Product
POST /api/products

<!-- {
  "name": "MacBook Pro",
  "description": "Apple Laptop",
  "price": 2500,
  "stock_quantity": 15,
  "category_id": 1
} -->

### Update Product
PUT /api/products/1

### Delete Product
DELETE /api/products/1

### Get Categories
GET /api/products/categories