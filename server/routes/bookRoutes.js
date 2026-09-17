const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    updateStock
} = require("../controllers/bookController");

router.get("/", getAllBooks);                                               //Retrieve all books from the database and return them as a JSON response.

router.get("/:id", getBookById);                                            //Retrieve a single book by its ID from the database and return it as a JSON response.

router.post("/", authMiddleware, adminMiddleware, createBook);               //Create a new book in the database. This route is protected by authentication and admin authorization middleware.

router.put("/:id", authMiddleware, adminMiddleware, updateBook);             //Update an existing book in the database. This route is protected by authentication and admin authorization middleware.

router.delete("/:id", authMiddleware, adminMiddleware, deleteBook);         //Delete an existing book from the database. This route is protected by authentication and admin authorization middleware.

router.patch("/:id/stock", authMiddleware, adminMiddleware, updateStock);   //Update the stock of an existing book in the database. This route is protected by authentication and admin authorization middleware.


module.exports = router;