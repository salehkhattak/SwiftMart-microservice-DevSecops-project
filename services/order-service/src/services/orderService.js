const pool =
require("../config/db");

const {
  publishNotificationEvent
} = require("./notificationPublisher");

const createOrder =
async (userId, { items }) => {

  if (
    !userId ||
    !items ||
    items.length === 0
  ) {
    throw new Error(
      "User and items are required"
    );
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const quantity =
      Number(item.quantity);

    if (
      !item.product_id ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        "Each item needs a valid product and quantity"
      );
    }

    const productResult =
    await pool.query(
      `
      SELECT id, price
      FROM products
      WHERE id = $1
      `,
      [item.product_id]
    );

    const product =
      productResult.rows[0];

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    const price =
      Number(product.price);

    totalAmount +=
      price * quantity;

    orderItems.push({
      product_id: product.id,
      quantity,
      price
    });
  }

  const orderResult =
  await pool.query(
    `
    INSERT INTO orders
    (
      user_id,
      total_amount
    )
    VALUES ($1,$2)
    RETURNING *
    `,
    [
      userId,
      totalAmount
    ]
  );

  const order =
  orderResult.rows[0];

  for (const item of orderItems) {

    await pool.query(
      `
      INSERT INTO order_items
      (
        order_id,
        product_id,
        quantity,
        price
      )
      VALUES
      ($1,$2,$3,$4)
      `,
      [
        order.id,
        item.product_id,
        item.quantity,
        item.price
      ]
    );

  }

await publishNotificationEvent({
    eventType: "ORDER_PLACED",
    user_id: userId,
    type: "ORDER",
    message: `Your order #${order.id} has been placed successfully`,
    order_id: order.id
});

  return {
    success: true,
    message:
      "Order created successfully",
    data: order
  };

};

const getOrders =
async (user) => {

  const isAdmin =
    user.role === "admin";

  const result =
  await pool.query(
    `
    SELECT *
    FROM orders
    ${isAdmin ? "" : "WHERE user_id = $1"}
    ORDER BY id DESC
    `,
    isAdmin ? [] : [user.userId]
  );

  return {
    success: true,
    data: result.rows
  };

};

const getOrderById =
async (user, id) => {

  const isAdmin =
    user.role === "admin";

  const order =
  await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1
      ${isAdmin ? "" : "AND user_id = $2"}
    `,
    isAdmin ? [id] : [id, user.userId]
  );

  if (
    order.rows.length === 0
  ) {
    throw new Error(
      "Order not found"
    );
  }

  const items =
  await pool.query(
    `
    SELECT *
    FROM order_items
    WHERE order_id = $1
    `,
    [id]
  );

  return {
    success: true,
    data: {
      order: order.rows[0],
      items: items.rows
    }
  };

};

const updateOrderStatus =
async (
  id,
  status
) => {

  const result =
  await pool.query(
    `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [
      status,
      id
    ]
  );

  if (
    result.rows.length === 0
  ) {
    throw new Error(
      "Order not found"
    );
  }

  const order =
    result.rows[0];

  if (status === "SHIPPED") {

    await publishNotificationEvent({
        eventType: "ORDER_SHIPPED",
        user_id: order.user_id,
        type: "ORDER",
        message:
          `Your order #${order.id} has been shipped successfully`,
        order_id: order.id
    });

  }

  if (status === "DELIVERED") {

    await publishNotificationEvent({
        eventType: "ORDER_DELIVERED",
        user_id: order.user_id,
        type: "ORDER",
        message:
          `Your order #${order.id} has been delivered successfully`,
        order_id: order.id
    });

  }

  return {
    success: true,
    message:
      "Order status updated",
    data: order
  };

};





module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  
};
