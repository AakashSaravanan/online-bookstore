const express = require("express");

const { createOrder } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Creates an order for the logged-in user
router.post("/", authMiddleware, createOrder);

module.exports = router;