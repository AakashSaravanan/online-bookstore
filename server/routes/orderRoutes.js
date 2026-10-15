
const express = require("express");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Customers can view only their own orders.
router.get("/my-orders", authMiddleware, getMyOrders);

// Only admins can view every customer's orders.
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

// Only admins can update an order's status.
router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

// Customers can place orders when logged in.
router.post("/", authMiddleware, createOrder);

module.exports = router;
