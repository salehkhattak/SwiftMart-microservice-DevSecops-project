const express = require("express");

const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require(
  "../controllers/cartController"
);

const {
  authenticate
} = require("../middleware/authMiddleware");

router.use(authenticate);

router.post("/", addToCart);

router.get("/", getCart);

router.get("/:userId", getCart);

router.put("/:itemId", updateCartItem);

router.delete("/", clearCart);

router.delete("/user/:userId", clearCart);

router.delete("/:itemId", deleteCartItem);

module.exports = router;
