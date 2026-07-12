// const express = require("express");

// const router = express.Router();

// const {
//   createNotification,
//   getNotifications,
//   getNotificationById,
//   deleteNotification,
//   getNotificationsByUser
// } = require(
//   "../controllers/notificationController"
// );

// router.post("/", createNotification);

// router.get("/", getNotifications);

// router.get("/:id", getNotificationById);

// router.delete("/:id", deleteNotification);

// router.get("/user/:userId", getNotificationsByUser);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotificationsByUser,
  getNotificationById,
  deleteNotification
} = require("../controllers/notificationController");

const {
  authenticate,
  requireInternalService
} = require("../middleware/authMiddleware");

router.post("/", requireInternalService, createNotification);

router.get("/me", authenticate, getNotificationsByUser);

router.get("/user/:userId", authenticate, getNotificationsByUser);

router.get("/single/:id", authenticate, getNotificationById);

router.delete("/:id", authenticate, deleteNotification);


module.exports = router;
