const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require(
  "../controllers/orderController"
);

const {
  authenticate,
  requireAdmin
} = require("../middleware/authMiddleware");

router.use(authenticate);

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/:id", getOrderById);

router.put(
  "/:id/status",
  requireAdmin,
  updateOrderStatus
);

module.exports = router;
