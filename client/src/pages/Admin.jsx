import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/api/books`;

const emptyForm = {
  title: "",
  author: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
};

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

// Admin dashboard for managing books and inventory.
function Admin() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [stockChanges, setStockChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all books from the backend.
  useEffect(() => {
    let ignore = false;

    const loadBooks = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load books.");
        }

        if (!ignore) {
          setBooks(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      ignore = true;
    };
  }, []);

  const refreshBooks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load books.");
      }

      setBooks(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    }
  };

  // Dashboard statistics.
  const totalBooks = books.length;

  const totalStock = books.reduce(
    (total, book) => total + (Number(book.stock) || 0),
    0
  );

  const outOfStock = books.filter(
    (book) => Number(book.stock) === 0
  ).length;

  const lowStock = books.filter(
    (book) => Number(book.stock) > 0 && Number(book.stock) <= 5
  ).length;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
  }

  function handleEdit(book) {
    setFormData({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      price: String(book.price ?? ""),
      category: book.category || "",
      stock: String(book.stock ?? 0),
      image: book.image || "",
    });

    setEditingId(book._id);
    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Create a new book or update an existing book.
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Please log in before managing books.");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    if (
      !payload.title.trim() ||
      !payload.author.trim() ||
      !payload.category.trim() ||
      formData.price.trim() === "" ||
      formData.stock.trim() === "" ||
      !Number.isFinite(payload.price) ||
      payload.price < 0 ||
      !Number.isInteger(payload.stock) ||
      payload.stock < 0
    ) {
      setError(
        "Enter a title, author, category, valid price, and whole-number stock of zero or more."
      );
      return;
    }

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save the book.");
      }

      setMessage(
        editingId
          ? "Book updated successfully."
          : "Book created successfully."
      );

      resetForm();
      await refreshBooks();
    } catch (err) {
      setError(err.message || "Unable to save the book.");
    }
  }

  // Delete a book after confirmation.
  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${book._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete the book.");
      }

      if (editingId === book._id) {
        resetForm();
      }

      setMessage("Book deleted successfully.");
      await refreshBooks();
    } catch (err) {
      setError(err.message || "Unable to delete the book.");
    }
  }

  // Adjust inventory using the existing stock API.
  async function handleStockUpdate(book) {
    const quantity = Number(stockChanges[book._id]);

    if (
      stockChanges[book._id] === undefined ||
      stockChanges[book._id] === "" ||
      !Number.isInteger(quantity) ||
      quantity === 0
    ) {
      setError("Enter a non-zero whole number to change stock.");
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${book._id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update stock.");
      }

      setMessage(
        `Stock updated successfully. New stock: ${data.stock}.`
      );

      setStockChanges((previous) => ({
        ...previous,
        [book._id]: "",
      }));

      await refreshBooks();
    } catch (err) {
      setError(err.message || "Unable to update stock.");
    }
  }

  return (
    <main className="admin-dashboard">

      {/* Dashboard Header */}
      <section className="admin-hero">
        <div className="admin-hero-content">
          <span className="admin-eyebrow">
            BOOKSTORE MANAGEMENT
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Manage your bookstore, organize your collection,
            and keep track of your inventory.
          </p>

          <div className="admin-hero-actions">
            <a href="#admin-book-form" className="admin-primary-link">
              + Add New Book
            </a>

            <Link to="/admin/orders" className="admin-secondary-link">
              Manage Orders <span>→</span>
            </Link>
          </div>
        </div>

        <div className="admin-hero-decoration" aria-hidden="true">
          <span>BOOKS</span>
          <span>COLLECTION</span>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          <span>!</span>
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {message && (
        <div className="admin-alert admin-alert-success" role="status">
          <span>✓</span>
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard Statistics */}
      <section className="admin-stats">
        <article className="admin-stat-card">
          <div className="admin-stat-icon">▤</div>
          <div>
            <span className="admin-stat-label">Total Titles</span>
            <h2>{loading ? "—" : totalBooks}</h2>
            <p>Books in your catalogue</p>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">▥</div>
          <div>
            <span className="admin-stat-label">Available Stock</span>
            <h2>{loading ? "—" : totalStock}</h2>
            <p>Total available copies</p>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">!</div>
          <div>
            <span className="admin-stat-label">Low Stock</span>
            <h2>{loading ? "—" : lowStock}</h2>
            <p>Titles with 5 or fewer copies</p>
          </div>
        </article>

        <article className="admin-stat-card admin-stat-warning">
          <div className="admin-stat-icon">○</div>
          <div>
            <span className="admin-stat-label">Out of Stock</span>
            <h2>{loading ? "—" : outOfStock}</h2>
            <p>Titles needing restocking</p>
          </div>
        </article>
      </section>

      {/* Add / Edit Book Form */}
      <section className="admin-section" id="admin-book-form">
        <div className="admin-section-heading">
          <div>
            <span className="admin-section-kicker">
              CATALOGUE MANAGEMENT
            </span>

            <h2>{editingId ? "Edit Book" : "Add a New Book"}</h2>

            <p>
              {editingId
                ? "Update the details of your selected book."
                : "Add a new title to your bookstore collection."}
            </p>
          </div>

          {editingId && (
            <span className="admin-edit-badge">
              EDITING MODE
            </span>
          )}
        </div>

        <form className="admin-book-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="admin-title">Book Title *</label>
              <input
                id="admin-title"
                name="title"
                placeholder="Enter book title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="admin-author">Author *</label>
              <input
                id="admin-author"
                name="author"
                placeholder="Enter author's name"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="admin-category">Category *</label>
              <input
                id="admin-category"
                name="category"
                placeholder="e.g. Fiction, Fantasy"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="admin-price">Price (₹) *</label>
              <input
                id="admin-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="admin-stock">Available Stock *</label>
              <input
                id="admin-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="Enter quantity"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="admin-image">Book Image</label>
              <input
                id="admin-image"
                name="image"
                placeholder="Image filename or URL"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-form-field admin-description-field">
            <label htmlFor="admin-description">Book Description</label>
            <textarea
              id="admin-description"
              name="description"
              placeholder="Write a short description about this book..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="admin-form-footer">
            <p>* Required fields</p>

            <div className="admin-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button type="submit" className="admin-submit-button">
                {editingId ? "Save Changes" : "+ Add Book"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Inventory Management */}
      <section className="admin-section admin-inventory-section">
        <div className="admin-section-heading admin-inventory-heading">
          <div>
            <span className="admin-section-kicker">
              YOUR COLLECTION
            </span>

            <h2>Book Inventory</h2>

            <p>
              Manage your books, prices, and stock availability.
            </p>
          </div>

          <span className="admin-inventory-count">
            {loading ? "Loading..." : `${totalBooks} TITLES`}
          </span>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-loader"></div>
            <p>Loading your inventory...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="admin-empty-state">
            <span>▤</span>
            <h3>Your inventory is empty</h3>
            <p>Add your first book to start building your collection.</p>
            <a href="#admin-book-form" className="admin-submit-button">
              + Add Your First Book
            </a>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-inventory-table">
              <thead>
                <tr>
                  <th>BOOK DETAILS</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>INVENTORY ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => {
                  const stock = Number(book.stock) || 0;

                  return (
                    <tr key={book._id}>
                      <td>
                        <div className="admin-book-info">
                          <div className="admin-book-thumbnail">
                            {book.image ? (
                              <img
                                src={
                                  book.image.startsWith("http")
                                    ? book.image
                                    : `/images/${book.image}`
                                }
                                alt={book.title}
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>BOOK</span>
                            )}
                          </div>

                          <div className="admin-book-text">
                            <strong>{book.title}</strong>
                            <span>{book.author}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-tag">
                          {book.category}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-book-price">
                          {formatPrice(book.price)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-stock-badge ${
                            stock === 0
                              ? "stock-out"
                              : stock <= 5
                                ? "stock-low"
                                : "stock-available"
                          }`}
                        >
                          {stock === 0
                            ? "Out of stock"
                            : stock <= 5
                              ? `${stock} left`
                              : `${stock} available`}
                        </span>
                      </td>

                      <td>
                        <div className="admin-inventory-actions">
                          <div className="admin-action-buttons">
                            <button
                              type="button"
                              className="admin-edit-button"
                              onClick={() => handleEdit(book)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() => handleDelete(book)}
                            >
                              Delete
                            </button>
                          </div>

                          <div className="admin-stock-controls">
                            <input
                              type="number"
                              step="1"
                              value={stockChanges[book._id] ?? ""}
                              placeholder="+3 / -2"
                              aria-label={`Stock change for ${book.title}`}
                              onChange={(event) =>
                                setStockChanges((previous) => ({
                                  ...previous,
                                  [book._id]: event.target.value,
                                }))
                              }
                            />

                            <button
                              type="button"
                              className="admin-stock-button"
                              onClick={() => handleStockUpdate(book)}
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;
