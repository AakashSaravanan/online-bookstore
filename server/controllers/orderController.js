
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Book = require("../models/Book");

// Creates an order after validating prices, shipping details, and stock.
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress } = req.body;

    // Validate the order items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your order must contain at least one book.",
      });
    }

    // Validate the shipping details
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        message: "Please provide all required shipping details.",
      });
    }

    if (!/^[0-9]{10}$/.test(shippingAddress.phone)) {
      return res.status(400).json({
        message: "Please provide a valid 10-digit phone number.",
      });
    }

    if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
      return res.status(400).json({
        message: "Please provide a valid 6-digit pincode.",
      });
    }

    // Combine repeated entries for the same book
    const quantities = new Map();

    for (const item of items) {
      if (
        !item.book ||
        !mongoose.isValidObjectId(item.book) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Each book must have a valid ID and positive whole-number quantity.",
        });
      }

      const id = item.book.toString();
      const quantity = (quantities.get(id) || 0) + item.quantity;

      if (!Number.isSafeInteger(quantity)) {
        return res.status(400).json({
          message: "Invalid book quantity.",
        });
      }

      quantities.set(id, quantity);
    }

    let savedOrder;

    // Update stock and create the order in one database transaction
    await session.withTransaction(async () => {
      const orderItems = [];
      let totalAmount = 0;

      for (const [bookId, quantity] of quantities) {
        // Get the actual book price and stock from MongoDB
        const book = await Book.findById(bookId).session(session);

        if (!book) {
          const error = new Error(`Book not found: ${bookId}`);
          error.statusCode = 404;
          throw error;
        }

        if (book.stock < quantity) {
          const error = new Error(
            `Not enough stock for "${book.title}". Available: ${book.stock}.`
          );
          error.statusCode = 409;
          throw error;
        }

        if (!Number.isFinite(book.price) || book.price < 0) {
          const error = new Error(
            `The price for "${book.title}" is invalid.`
          );
          error.statusCode = 500;
          throw error;
        }

        // Reduce stock only if enough copies remain
        const stockUpdate = await Book.updateOne(
          {
            _id: book._id,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          { session }
        );

        if (stockUpdate.modifiedCount !== 1) {
          const error = new Error(
            `Stock changed while ordering "${book.title}". Please try again.`
          );
          error.statusCode = 409;
          throw error;
        }

        // Store the database price, not a price supplied by the frontend
        orderItems.push({
          book: book._id,
          quantity,
          price: book.price,
        });

        totalAmount += book.price * quantity;
      }

      // Save the order with the authenticated user's ID
      const orders = await Order.create(
        [
          {
            user: req.user.userId,
            items: orderItems,
            shippingAddress: {
              name: shippingAddress.name.trim(),
              email: shippingAddress.email.trim(),
              phone: shippingAddress.phone.trim(),
              address: shippingAddress.address.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode: shippingAddress.pincode.trim(),
            },
            totalAmount,
          },
        ],
        { session }
      );

      savedOrder = orders[0];
    });

    return res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode && error.statusCode !== 500
          ? error.message
          : "Failed to create order",
    });
  } finally {
    await session.endSession();
  }
};


// Retrieves only the orders belonging to the logged-in customer.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      // Include book details so the frontend can display titles.
      .populate("items.book", "title author image")
      // Show the newest orders first.
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      message: "Failed to retrieve your orders.",
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.book", "title author image")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      message: "Failed to retrieve orders.",
    });
  }
};

// Updates an order's status and restores stock if it is cancelled.
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = [
    "Processing",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status.",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid order ID.",
    });
  }

  const allowedTransitions = {
    Processing: ["Confirmed", "Cancelled"],
    Confirmed: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
  };

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        const error = new Error("Order not found.");
        error.statusCode = 404;
        throw error;
      }

      if (!allowedTransitions[order.status]?.includes(status)) {
        const error = new Error(
          `Cannot change order status from ${order.status} to ${status}.`
        );
        error.statusCode = 409;
        throw error;
      }

      // Return the reserved copies to inventory when an order is cancelled.
      if (status === "Cancelled") {
        for (const item of order.items) {
          const stockUpdate = await Book.updateOne(
            { _id: item.book },
            { $inc: { stock: item.quantity } },
            { session }
          );

          if (stockUpdate.matchedCount !== 1) {
            const error = new Error(
              "A book in this order no longer exists; cancellation could not restore all stock."
            );
            error.statusCode = 409;
            throw error;
          }
        }
      }

      order.status = status;
      await order.save({ session });
    });

    const updatedOrder = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.book", "title author image");

    return res.status(200).json({
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode && error.statusCode !== 500
          ? error.message
          : "Failed to update order status.",
    });
  } finally {
    await session.endSession();
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};