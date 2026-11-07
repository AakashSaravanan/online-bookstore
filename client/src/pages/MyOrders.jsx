
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the logged-in customer's order history.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load your orders.");
        }

        setOrders(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format prices as Indian rupees.
  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  // Display a readable order date.
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Generate a CSS class based on the order status.
  const getStatusClass = (status) =>
    `my-order-status status-${status?.toLowerCase() || "unknown"}`;

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-loading">
          <div className="my-orders-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-heading">
          <span className="my-orders-eyebrow">YOUR ACCOUNT</span>
          <h1>My Orders</h1>
        </div>

        <div className="my-orders-error" role="alert">
          <h2>Unable to load your orders</h2>
          <p>{error}</p>
          <Link to="/books" className="my-orders-action">
            Browse Books
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="my-orders-page">

      {/* Page heading */}
      <section className="my-orders-heading">
        <div>
          <span className="my-orders-eyebrow">YOUR ACCOUNT</span>
          <h1>My Orders<span>.</span></h1>
          <p>Every book has a story. Here's the history of yours.</p>
        </div>

        <Link to="/books" className="my-orders-browse-btn">
          Continue Shopping
          <span>→</span>
        </Link>
      </section>

      {/* Order summary */}
      <section className="my-orders-summary">
        <div className="my-orders-summary-icon">▤</div>
        <div>
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>
      </section>

      {/* Empty orders state */}
      {orders.length === 0 ? (
        <section className="my-orders-empty">
          <div className="my-orders-empty-icon">📚</div>
          <h2>Your reading journey starts here.</h2>
          <p>
            You haven't placed any orders yet. Explore our collection
            and discover your next favourite book.
          </p>
          <Link to="/books" className="my-orders-action">
            Explore Books
            <span>→</span>
          </Link>
        </section>
      ) : (

        /* Order list */
        <section className="my-orders-list">
          <div className="my-orders-list-heading">
            <h2>Order History</h2>
            <span>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          {orders.map((order) => (
            <article className="my-order-card" key={order._id}>

              {/* Order header */}
              <div className="my-order-header">
                <div className="my-order-info">
                  <span>ORDER ID</span>
                  <h3>#{order._id.slice(-8).toUpperCase()}</h3>
                </div>

                <div className="my-order-info my-order-date">
                  <span>ORDER DATE</span>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <div className="my-order-status-wrapper">
                  <span>ORDER STATUS</span>
                  <span className={getStatusClass(order.status)}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Purchased books */}
              <div className="my-order-items">
                {order.items.map((item, index) => (
                  <div
                    className="my-order-item"
                    key={`${item.book?._id || "deleted"}-${index}`}
                  >
                    <div className="my-order-book">

                      {item.book?.image ? (
                        <img
                        src={`/images/${item.book.image}`}
                        alt={item.book?.title || "Book cover"}
                        className="my-order-book-image"
                      />
                      ) : (
                        <div className="my-order-book-placeholder">
                          BOOK
                        </div>
                      )}

                      <div className="my-order-book-details">
                        <h4>
                          {item.book?.title || "Book no longer available"}
                        </h4>

                        {item.book?.author && (
                          <p>by {item.book.author}</p>
                        )}

                        <span>Quantity: {item.quantity}</span>
                      </div>
                    </div>

                    <strong className="my-order-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="my-order-footer">
                <span>Total Amount</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>

            </article>
          ))}
        </section>
      )}

    </main>
  );
}

export default MyOrders;
