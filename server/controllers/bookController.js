const Book = require("../models/Book");

const getAllBooks = async (req, res) => {       //Retrieve all book documents from the MongoDB collection using the Book model. It also supports filtering by category and searching by title or author.
    const { category, search } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } }
        ];
    }

    const books = await Book.find(filter);

    res.status(200).json(books);
};

const getBookById = async (req, res) => {       //Retrieve a single book document from the MongoDB collection using the Book model and the ID provided in the request parameters.
    const book = await Book.findById(req.params.id);

    res.status(200).json(book);
};

const createBook = async (req, res) => {        //Create a new book document in the MongoDB collection.
    const {
        title,
        author,
        description,
        price,
        category,
        stock,
        image
    } = req.body;

    const book = await Book.create({
        title,
        author,
        description,
        price,
        category,
        stock,
        image
    });

    res.status(201).json(book);
};

const updateBook = async (req, res) => {        //Update an existing book document in the MongoDB collection.
    const book = await Book.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json(book);
};

const deleteBook = async (req, res) => {        //Delete an existing book document from the MongoDB collection.
    const book = await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: "Book deleted successfully",
        book
    });
};

const updateStock = async (req, res) => {       //Update the stock of a book document in the MongoDB collection. It takes the quantity to be added or subtracted from the stock as input.
    const { quantity } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const newStock = book.stock + quantity;

    if (newStock < 0) {
        return res.status(400).json({
            message: "Insufficient stock"
        });
    }

    book.stock = newStock;

    await book.save();

    res.status(200).json({
        message: "Stock updated successfully",
        stock: book.stock
    });
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    updateStock
};