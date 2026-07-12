const pool = require("../config/db");
const {
  getCache,
  setCache,
  deleteCache,
  deleteByPattern
} = require("../config/redis");

const PRODUCT_CACHE_TTL_SECONDS = 60;

const getCategories = async () => {
    const cacheKey = "categories:all";
    const cachedCategories = await getCache(cacheKey);

    if (cachedCategories) {
        return cachedCategories;
    }

    const result = await pool.query(

        `SELECT *
        FROM categories
        ORDER BY id
        `
    );

    const response = {
        success: true,
        data: result.rows
    };

    await setCache(
        cacheKey,
        response,
        PRODUCT_CACHE_TTL_SECONDS
    );

    return response;
};

const getProducts = async (search, category) => {
  const cacheKey = `products:list:${search || "all"}:${category || "all"}`;
  const cachedProducts = await getCache(cacheKey);

  if (cachedProducts) {
    return cachedProducts;
  }

  let query = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock_quantity,
      c.name AS category
    FROM products p
    JOIN categories c
      ON p.category_id = c.id
    WHERE 1=1
  `;

  const values = [];

  if (search) {
    values.push(`%${search}%`);
    query += ` AND p.name ILIKE $${values.length}`;
  }

  if (category) {
    values.push(category);
    query += ` AND p.category_id = $${values.length}`;
  }

  query += ` ORDER BY p.id`;

  const result =
    await pool.query(query, values);

  const response = {
    success: true,
    data: result.rows
  };

  await setCache(
    cacheKey,
    response,
    PRODUCT_CACHE_TTL_SECONDS
  );

  return response;
};

const getProductById = async (id) => {
  const cacheKey = `products:item:${id}`;
  const cachedProduct = await getCache(cacheKey);

  if (cachedProduct) {
    return cachedProduct;
  }

  const result = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock_quantity,
      c.name AS category
    FROM products p
    JOIN categories c
      ON p.category_id = c.id
    WHERE p.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Product not found");
  }

  const response = {
    success: true,
    data: result.rows[0]
  };

  await setCache(
    cacheKey,
    response,
    PRODUCT_CACHE_TTL_SECONDS
  );

  return response;
};

const clearProductCache = async (productId) => {
  await deleteByPattern("products:list:*");
  await deleteCache([
    "categories:all",
    `products:item:${productId}`
  ]);
};

const createProduct = async ({
  name,
  description,
  price,
  stock_quantity,
  category_id
}) => {

  if (
    !name ||
    !description ||
    !price ||
    !stock_quantity ||
    !category_id
  ) {
    throw new Error("All fields are required");
  }

  const result = await pool.query(
    `
    INSERT INTO products
    (
      name,
      description,
      price,
      stock_quantity,
      category_id
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      name,
      description,
      price,
      stock_quantity,
      category_id
    ]
  );

  await clearProductCache(result.rows[0].id);

  return {
    success: true,
    message: "Product created successfully",
    data: result.rows[0]
  };
};

const updateProduct = async (
  id,
  {
    name,
    description,
    price,
    stock_quantity,
    category_id
  }
) => {

  const existingProduct = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  if (existingProduct.rows.length === 0) {
    throw new Error("Product not found");
  }

  const result = await pool.query(
    `
    UPDATE products
    SET
      name = $1,
      description = $2,
      price = $3,
      stock_quantity = $4,
      category_id = $5
    WHERE id = $6
    RETURNING *
    `,
    [
      name,
      description,
      price,
      stock_quantity,
      category_id,
      id
    ]
  );

  await clearProductCache(id);

  return {
    success: true,
    message: "Product updated successfully",
    data: result.rows[0]
  };
};

const deleteProduct = async (id) => {

  const existingProduct = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  if (existingProduct.rows.length === 0) {
    throw new Error("Product not found");
  }

  await pool.query(
    "DELETE FROM products WHERE id = $1",
    [id]
  );

  await clearProductCache(id);

  return {
    success: true,
    message: "Product deleted successfully"
  };
};

module.exports = {
    getCategories,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
