require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();

app.use(express.json());    //Express will understand JSON requests bodies.

app.use("/api/auth", authRoutes);   //Tell Express where these routes belong.
app.use("/api/books", bookRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Online Bookstore API is running");
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();