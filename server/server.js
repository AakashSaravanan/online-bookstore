require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const connectDB = require("./config/db");

const app = express();
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