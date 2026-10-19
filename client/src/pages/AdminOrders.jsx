import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/api/orders/admin`;

const statuses = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
  async function loadInitialOrders() {
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  loadInitialOrders();
}, [token]);

  async function handleStatusChange(order, status) {
    if (status === "Cancelled") {
      const confirmed = window.confirm(
        `Cancel order #${order._id.slice(-8)}?`
      );

      if (!confirmed) return;
    }

    setError("");
    setMessage("");
    setUpdatingId(order._id);

    try {
      const response = await fetch(`${API_URL}/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order.");
      }

      setOrders((previous) =>
        previous.map((item) =>
          item._id === order._id ? data.order : item
        )
      );

      setMessage(`Order status changed to ${status}.`);
    } catch (err) {
      setError(err.message || "Unable to update order.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "30px auto", padding: "20px" }}>
      <p><Link to="/admin">← Back to Admin Dashboard</Link></p>
      <h1>Manage Orders</h1>
      <p>Review customer purchases and update their fulfillment status.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No customer orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => {
            const currentIndex = statuses.indexOf(order.status);
            const nextStatuses =
              order.status === "Processing"
                ? ["Confirmed", "Cancelled"]
                : order.status === "Confirmed"
                  ? ["Shipped", "Cancelled"]
                  : order.status === "Shipped"
                    ? ["Delivered"]
                    : [];

            return (
              <article
                key={order._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h2>Order #{order._id.slice(-8)}</h2>
                    <p>Placed: {formatDate(order.createdAt)}</p>
                    <p>
                      Customer: {order.user?.name || "Customer"}{" "}
                      {order.user?.email ? `(${order.user.email})` : ""}
                    </p>
                  </div>

                  <strong>Status: {order.status}</strong>
                </div>

                <h3>Items</h3>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${item.book?._id || "deleted"}-${index}`}>
                      {item.book?.title || "Book no longer available"}
                      {" — "}
                      Qty: {item.quantity}
                      {" × "}
                      {formatPrice(item.price)}
                    </li>
                  ))}
                </ul>

                <p>
                  <strong>Total: {formatPrice(order.totalAmount)}</strong>
                </p>

                <details>
                  <summary>Shipping details</summary>
                  <p>
                    {order.shippingAddress?.name}<br />
                    {order.shippingAddress?.address}<br />
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.pincode}<br />
                    {order.shippingAddress?.phone}<br />
                    {order.shippingAddress?.email}
                  </p>
                </details>

                {nextStatuses.length > 0 ? (
                  <div style={{ marginTop: "16px" }}>
                    <label htmlFor={`status-${order._id}`}>
                      Update status:{" "}
                    </label>

                    <select
                      id={`status-${order._id}`}
                      value=""
                      disabled={updatingId === order._id}
                      onChange={(event) =>
                        handleStatusChange(order, event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Choose next status
                      </option>
                      {nextStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {updatingId === order._id && <span> Updating...</span>}
                  </div>
                ) : (
                  <p>
                    {currentIndex >= 0
                      ? `This order is ${order.status.toLowerCase()} and has no further status changes.`
                      : "No further status changes available."}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default AdminOrders;
