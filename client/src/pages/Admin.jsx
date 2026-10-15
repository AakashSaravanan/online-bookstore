import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/books";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
};

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

  async function fetchBooks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load books.");
      }

      setBooks(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

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

      setMessage(editingId ? "Book updated successfully." : "Book created successfully.");
      resetForm();
      await fetchBooks();
    } catch (err) {
      setError(err.message || "Unable to save the book.");
    }
  }

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
      await fetchBooks();
    } catch (err) {
      setError(err.message || "Unable to delete the book.");
    }
  }

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

      await fetchBooks();
    } catch (err) {
      setError(err.message || "Unable to update stock.");
    }
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "30px auto", padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <p>
        <Link to="/admin/orders">Manage Customer Orders</Link>
      </p>
      <p>Manage your bookstore's books and inventory.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      <section>
        <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <input
              name="title"
              placeholder="Book title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <input
              name="author"
              placeholder="Author"
              value={formData.author}
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price (₹)"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />

            <input
              name="image"
              placeholder="Image filename or URL"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="description"
            placeholder="Book description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{ display: "block", width: "100%", marginTop: "12px" }}
          />

          <button type="submit" style={{ marginTop: "12px" }}>
            {editingId ? "Save Changes" : "Add Book"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ marginLeft: "10px" }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <hr style={{ margin: "30px 0" }} />

      <section>
        <h2>Manage Books ({books.length})</h2>

        {loading ? (
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "10px" }}>Title</th>
                  <th style={{ padding: "10px" }}>Price</th>
                  <th style={{ padding: "10px" }}>Stock</th>
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td style={{ padding: "10px" }}>
                      <strong>{book.title}</strong>
                      <br />
                      <small>{book.author}</small>
                    </td>

                    <td style={{ padding: "10px" }}>₹{book.price}</td>

                    <td style={{ padding: "10px" }}>{book.stock}</td>

                    <td style={{ padding: "10px", minWidth: "250px" }}>
                      <button type="button" onClick={() => handleEdit(book)}>
                        Edit
                      </button>{" "}

                      <button type="button" onClick={() => handleDelete(book)}>
                        Delete
                      </button>

                      <div style={{ marginTop: "10px" }}>
                        <input
                          type="number"
                          step="1"
                          value={stockChanges[book._id] ?? ""}
                          placeholder="+3 or -2"
                          aria-label={`Stock change for ${book.title}`}
                          onChange={(event) =>
                            setStockChanges((previous) => ({
                              ...previous,
                              [book._id]: event.target.value,
                            }))
                          }
                          style={{ width: "100px" }}
                        />{" "}

                        <button
                          type="button"
                          onClick={() => handleStockUpdate(book)}
                        >
                          Update Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;