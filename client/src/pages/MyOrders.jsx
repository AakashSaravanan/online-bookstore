import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the logged-in customer's order history.
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/orders/my-orders", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load your orders."
          );
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
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return <main className="my-orders-page"><p>Loading your orders...</p></main>;
  }

  if (error) {
    return (
      <main className="my-orders-page">
        <h2>My Orders</h2>
        <p role="alert">{error}</p>
        <Link to="/books">Browse books</Link>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <h1>My Orders</h1>
      <p>View your previous purchases and order status.</p>

      {orders.length === 0 ? (
        <section className="my-orders-empty">
          <h2>No orders yet</h2>
          <p>Your purchases will appear here after checkout.</p>
          <Link to="/books">Browse Books</Link>
        </section>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => (
            <article className="my-order-card" key={order._id}>
              <div className="my-order-header">
                <div>
                  <h2>Order #{order._id.slice(-8)}</h2>
                  <p>Placed on {formatDate(order.createdAt)}</p>
                </div>

                <span className="my-order-status">
                  {order.status}
                </span>
              </div>

              <div className="my-order-items">
                {order.items.map((item, index) => (
                  <div
                    className="my-order-item"
                    key={`${item.book?._id || "deleted"}-${index}`}
                  >
                    <div>
                      <strong>
                        {item.book?.title || "Book no longer available"}
                      </strong>

                      {item.book?.author && (
                        <p>by {item.book.author}</p>
                      )}

                      <p>Quantity: {item.quantity}</p>
                    </div>

                    <strong>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="my-order-total">
                <span>Order Total</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyOrders;
