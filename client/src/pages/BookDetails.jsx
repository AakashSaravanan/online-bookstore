import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { loadCart, saveCart } from "../utils/cart";
import API_BASE_URL from "../api";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadBook = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`);

        if (!response.ok) {
          throw new Error("Book not found");
        }

        const data = await response.json();

        if (!ignore) {
          setBook(data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load the book.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      ignore = true;
    };
  }, [id]);
  
  // Add the selected book to the existing cart.
  const handleAddToCart = () => {
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
    setCartMessage("Added to your cart successfully!");

    setTimeout(() => {
      setCartMessage("");
    }, 3000);
  };

  if (loading) {
    return (
      <main className="book-details-state">
        <p>Loading book details...</p>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="book-details-state">
        <h2>We couldn't find this book.</h2>
        <p>{error || "The requested book is unavailable."}</p>
        <Link to="/books" className="details-back-button">
          Back to Books
        </Link>
      </main>
    );
  }

  const inStock = book.stock > 0;

  return (
    <main className="book-details-page">
      <nav className="details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/books">Books</Link>
        <span>/</span>
        <span className="breadcrumb-current">{book.title}</span>
      </nav>

      <section className="book-details">
        <div className="book-details-image-container">
          {book.image ? (
            <img
              src={`/images/${book.image}`}
              alt={book.title}
              className="book-details-image"
            />
          ) : (
            <div className="details-image-placeholder">
              <span>BOOK</span>
            </div>
          )}
        </div>

        <div className="book-details-info">
          <span className="details-category">{book.category}</span>

          <p className="details-eyebrow">DISCOVER YOUR NEXT READ</p>

          <h1>{book.title}</h1>

          <p className="details-author">
            Written by <strong>{book.author}</strong>
          </p>

          <div className="details-divider" />

          <div className="details-description">
            <h2>About this book</h2>
            <p>{book.description || "No description available."}</p>
          </div>

          <div className="details-purchase-panel">
            <div className="details-price-row">
              <div>
                <span className="details-price-label">Our Price</span>
                <p className="details-price">₹{book.price}</p>
              </div>

              <span
                className={`details-stock ${
                  inStock ? "available" : "unavailable"
                }`}
              >
                <span className="stock-indicator" />
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <p className="details-stock-count">
              {inStock
                ? `${book.stock} ${book.stock === 1 ? "copy" : "copies"} available`
                : "Currently unavailable"}
            </p>

            <button
              className="add-to-cart-button"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
              {inStock && <span aria-hidden="true">→</span>}
            </button>

            {cartMessage && (
              <p className="cart-success-message" role="status">
                {cartMessage}
              </p>
            )}
          </div>

          <Link to="/books" className="details-back-link">
            <span aria-hidden="true">←</span> Continue Exploring Books
          </Link>
        </div>
      </section>
    </main>
  );
}

export default BookDetails;