const pool =
require("../config/db");

const addToCart =
async (
  userId,
  {
  product_id,
  quantity
}) => {

  if (
    !userId ||
    !product_id ||
    !quantity
  ) {
    throw new Error(
      "All fields are required"
    );
  }

  const result =
  await pool.query(
    `
    INSERT INTO cart_items
    (
      user_id,
      product_id,
      quantity
    )
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [
      userId,
      product_id,
      quantity
    ]
  );

  return {
    success: true,
    message:
      "Item added to cart",
    data: result.rows[0]
  };

};

// const getCart =
// async (userId) => {

//   const result =
//   await pool.query(
//     `
//     SELECT *
//     FROM cart_items
//     WHERE user_id = $1
//     ORDER BY id
//     `,
//     [userId]
//   );

//   return {
//     success: true,
//     data: result.rows
//   };

// };

const getCart =
async (userId) => {

  const result =
  await pool.query(
    `
    SELECT
      c.id,
      c.user_id,
      c.product_id,
      c.quantity,

      p.name AS product_name,
      p.description,
      p.price,
      p.stock_quantity

    FROM cart_items c

    JOIN products p
      ON c.product_id = p.id

    WHERE c.user_id = $1

    ORDER BY c.id
    `,
    [userId]
  );

  return {
    success: true,
    data: result.rows
  };

};

const updateCartItem =
async (
  userId,
  itemId,
  quantity
) => {

  const result =
  await pool.query(
    `
    UPDATE cart_items
    SET quantity = $1
    WHERE id = $2
      AND user_id = $3
    RETURNING *
    `,
    [
      quantity,
      itemId,
      userId
    ]
  );

  if (
    result.rows.length === 0
  ) {
    throw new Error(
      "Cart item not found"
    );
  }

  return {
    success: true,
    message:
      "Cart updated",
    data: result.rows[0]
  };

};

const deleteCartItem =
async (userId, itemId) => {

  const result =
  await pool.query(
    `
    DELETE FROM cart_items
    WHERE id = $1
      AND user_id = $2
    RETURNING *
    `,
    [itemId, userId]
  );

  if (
    result.rows.length === 0
  ) {
    throw new Error(
      "Cart item not found"
    );
  }

  return {
    success: true,
    message:
      "Cart item deleted"
  };

};

const clearCart =
async (userId) => {

  await pool.query(
    `
    DELETE FROM cart_items
    WHERE user_id = $1
    `,
    [userId]
  );

  return {
    success: true,
    message:
      "Cart cleared"
  };

};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};
