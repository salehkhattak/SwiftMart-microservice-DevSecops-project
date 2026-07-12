const pool =
require("../config/db");

// const createNotification =
// async ({
//   user_id,
//   type,
//   message
// }) => {

//   if (
//     !user_id ||
//     !type ||
//     !message
//   ) {
//     throw new Error(
//       "All fields are required"
//     );
//   }

//   const result =
//   await pool.query(
//     `
//     INSERT INTO notifications
//     (
//       user_id,
//       type,
//       message,
//       order_id
//     )
//     VALUES ($1,$2,$3)
//     RETURNING *
//     `,
//     [
//       user_id,
//       type,
//       message
//     ]
//   );

//   console.log(
//     `Notification Sent: ${message}`
//   );

//   return {
//     success: true,
//     message:
//       "Notification created",
//     data: result.rows[0]
//   };

// };

// const getNotifications =
// async () => {

//   const result =
//   await pool.query(
//     `
//     SELECT *
//     FROM notifications
//     ORDER BY id DESC
//     `
//   );

//   return {
//     success: true,
//     data: result.rows
//   };

// };

const createNotification = async ({
  user_id,
  type,
  message,
  order_id
}) => {

  if (!user_id || !type || !message) {
    throw new Error("All fields are required");
  }

  const result = await pool.query(
    `
    INSERT INTO notifications
    (user_id, type, message, order_id, status)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      user_id,
      type,
      message,
      order_id || null,
      "SENT"
    ]
  );

  console.log(`Notification Sent: ${message}`);

  return {
    success: true,
    message: "Notification created",
    data: result.rows[0]
  };
};


const getNotificationsByUser = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY id DESC
    `,
    [userId]
  );

  return {
    success: true,
    data: result.rows
  };
};


const getNotificationById =
async (user, id) => {

  const isAdmin =
    user.role === "admin";

  const result =
  await pool.query(
    `
    SELECT *
    FROM notifications
    WHERE id = $1
      ${isAdmin ? "" : "AND user_id = $2"}
    `,
    isAdmin ? [id] : [id, user.userId]
  );

  if (
    result.rows.length === 0
  ) {
    throw new Error(
      "Notification not found"
    );
  }

  return {
    success: true,
    data: result.rows[0]
  };

};



const deleteNotification =
async (user, id) => {

  const isAdmin =
    user.role === "admin";

  const result =
  await pool.query(
    `
    DELETE FROM notifications
    WHERE id = $1
      ${isAdmin ? "" : "AND user_id = $2"}
    RETURNING *
    `,
    isAdmin ? [id] : [id, user.userId]
  );

  if (
    result.rows.length === 0
  ) {
    throw new Error(
      "Notification not found"
    );
  }

  return {
    success: true,
    message:
      "Notification deleted"
  };

};

module.exports = {
  createNotification,
  // getNotifications,
  getNotificationById,
  deleteNotification,
  getNotificationsByUser
};

