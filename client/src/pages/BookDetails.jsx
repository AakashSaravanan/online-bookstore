import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { loadCart, saveCart } from "../utils/cart";
import API_BASE_URL from "../api";

function BookDetails() {
  // Get the book ID from the URL
  const { id } = useParams();

  // Get the navigate function to programmatically navigate to other pages
  const navigate = useNavigate();

  // Store the book received from the backend
  const [book, setBook] = useState(null);

  // Store whether the book is currently loading
  const [loading, setLoading] = useState(true);

  // Store an error message if the request fails
  const [error, setError] = useState("");

  // Store the success message shown when a book is added to the cart
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/books/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Book not found");
        }

        return response.json();
      })
      .then((data) => {
        setBook(data);
      })
      .catch((err) => {
        setError(err.message || "Unable to load the book.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  
// Add the book to the cart and navigate to the cart page  
const handleAddToCart = () => {
  // Require login before adding a book to a cart.
  if (!localStorage.getItem("token")) {
    navigate("/login", {
      state: { from: `/books/${book._id}` },
    });
    return;
  }

  const currentItems = loadCart();
  const existingItem = currentItems.find(
    (item) => item._id === book._id
  );

  let updatedCart;

  if (existingItem) {
    updatedCart = currentItems.map((item) =>
      item._id === book._id
        ? {
            ...item,
            quantity: Math.min(item.quantity + 1, item.stock),
          }
        : item
    );
  } else {
    updatedCart = [...currentItems, { ...book, quantity: 1 }];
  }

  saveCart(updatedCart);
  setCartMessage("Added to cart successfully!");

  setTimeout(() => {
    setCartMessage("");
  }, 3000);
};

  // Show loading message while waiting for the backend
  if (loading) {
    return <p>Loading book...</p>;
  }

  // Show error message if something went wrong
  if (error) {
    return <p>{error}</p>;
  }

  return (
  <div className="book-details">
    {/* Left side: book image */}
    <div className="book-details-image-container">
      <img
        src={`/images/${book.image}`}
        alt={book.title}
        className="book-details-image"
      />
    </div>

    {/* Right side: book information */}
    <div className="book-details-info">
      <h1>{book.title}</h1>

      <h3>By {book.author}</h3>

      <p>{book.description}</p>

      <p>
        <strong>Category:</strong> {book.category}
      </p>

      <p>
        <strong>Price:</strong> ₹{book.price}
      </p>

      <p>
        <strong>Stock:</strong> {book.stock}
      </p>
      {/* Add to Cart will be connected to the cart system later */}
      
      <button
        className="add-to-cart-button"
        disabled={book.stock === 0}
        onClick={handleAddToCart}
      >
        {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>

      {cartMessage && (
        <p style={{ color: "green" }} role="status">
            {cartMessage}
        </p>
      )}

    <Link to="/books">← Back to Books</Link>
    </div>
  </div>
);
}

export default BookDetails;