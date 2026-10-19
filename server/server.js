require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Allow requests from the configured frontend origins.
// Use localhost during development and your deployed URL in production.
const allowedOrigins = (
    process.env.CLIENT_URL || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Requests without an Origin header include Postman and server-to-server calls.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
    })
);

app.use(express.json());    //Express will understand JSON requests bodies.
app.use("/api/auth", authRoutes);       //Tell Express where these routes belong
app.use("/api/books", bookRoutes);      // Handles all book-related API requests
app.use("/api/orders", orderRoutes);    // Handles all order-related API requests

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Online Bookstore API is running");
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};

startServer();