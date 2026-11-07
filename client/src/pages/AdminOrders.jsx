import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/api/orders/admin`;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load orders.");
        }

        if (!ignore) {
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Something went wrong while loading orders.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, []);
  const getAvailableStatuses = (status) => {
    switch (status) {
      case "Processing":
        return ["Confirmed", "Cancelled"];
      case "Confirmed":
        return ["Shipped", "Cancelled"];
      case "Shipped":
        return ["Delivered"];
      default:
        return [];
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === "Cancelled") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      );

      if (!confirmed) return;
    }

    try {
      setUpdatingOrder(orderId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }

      const updatedOrder = data.order || data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? { ...order, ...updatedOrder, status: updatedOrder.status || newStatus }
            : order
        )
      );

      setMessage(`Order status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message || "Unable to update order status.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Processing":
        return "admin-order-status-processing";
      case "Confirmed":
        return "admin-order-status-confirmed";
      case "Shipped":
        return "admin-order-status-shipped";
      case "Delivered":
        return "admin-order-status-delivered";
      case "Cancelled":
        return "admin-order-status-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const totalOrders = orders.length;
  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  if (loading) {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-loading">
          <span className="admin-orders-loader"></span>
          <p>Loading order information...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-orders-page">
      {/* Page header */}
      <section className="admin-orders-hero">
        <div className="admin-orders-hero-content">
          <div className="admin-orders-breadcrumb">
            <Link to="/admin">Admin Dashboard</Link>
            <span>/</span>
            <span>Orders</span>
          </div>

          <p className="admin-orders-eyebrow">STORE MANAGEMENT</p>

          <h1>
            Order <span>Management</span>
          </h1>

          <p className="admin-orders-hero-description">
            Track customer purchases, manage order progress, and keep every
            delivery moving smoothly.
          </p>

          <Link to="/admin" className="admin-orders-back-link">
            <span aria-hidden="true">←</span> Back to Dashboard
          </Link>
        </div>

        <div className="admin-orders-hero-decoration" aria-hidden="true">
          <span className="admin-orders-decoration-number">ORDERS</span>
          <span className="admin-orders-decoration-line"></span>
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <div className="admin-orders-alert admin-orders-alert-error">
          <span>!</span>
          {error}
        </div>
      )}

      {message && (
        <div className="admin-orders-alert admin-orders-alert-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* Order statistics */}
      <section className="admin-orders-stats">
        <article className="admin-orders-stat-card">
          <div className="admin-orders-stat-top">
            <span className="admin-orders-stat-icon">▤</span>
            <span className="admin-orders-stat-caption">ALL ORDERS</span>
          </div>
          <strong>{totalOrders}</strong>
          <p>Total customer orders</p>
        </article>

        <article className="admin-orders-stat-card">
          <div className="admin-orders-stat-top">
            <span className="admin-orders-stat-icon">◷</span>
            <span className="admin-orders-stat-caption">PROCESSING</span>
          </div>
          <strong>{processingOrders}</strong>
          <p>Awaiting confirmation</p>
        </article>

        <article className="admin-orders-stat-card">
          <div className="admin-orders-stat-top">
            <span className="admin-orders-stat-icon">➤</span>
            <span className="admin-orders-stat-caption">SHIPPED</span>
          </div>
          <strong>{shippedOrders}</strong>
          <p>Currently in transit</p>
        </article>

        <article className="admin-orders-stat-card">
          <div className="admin-orders-stat-top">
            <span className="admin-orders-stat-icon">✓</span>
            <span className="admin-orders-stat-caption">DELIVERED</span>
          </div>
          <strong>{deliveredOrders}</strong>
          <p>Successfully completed</p>
        </article>
      </section>

      {/* Orders list */}
      <section className="admin-orders-list-section">
        <div className="admin-orders-section-heading">
          <div>
            <p className="admin-orders-section-kicker">CUSTOMER PURCHASES</p>
            <h2>Recent Orders</h2>
            <p>Review order details and update their fulfilment status.</p>
          </div>

          <span className="admin-orders-count">
            {totalOrders} {totalOrders === 1 ? "ORDER" : "ORDERS"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="admin-orders-empty">
            <div className="admin-orders-empty-icon">▤</div>
            <h3>No orders yet</h3>
            <p>
              Customer orders will appear here when someone makes a purchase.
            </p>
            <Link to="/admin" className="admin-orders-empty-link">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => {
              const availableStatuses = getAvailableStatuses(order.status);
              const isExpanded = expandedOrder === order._id;
              const isUpdating = updatingOrder === order._id;

              return (
                <article className="admin-order-card" key={order._id}>
                  {/* Order summary */}
                  <div className="admin-order-card-header">
                    <div className="admin-order-identity">
                      <div className="admin-order-icon">#</div>
                      <div>
                        <span className="admin-order-label">ORDER ID</span>
                        <h3>#{order._id.slice(-8).toUpperCase()}</h3>
                        <span className="admin-order-date">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`admin-order-status ${getStatusClass(
                        order.status
                      )}`}
                    >
                      <span className="admin-order-status-dot"></span>
                      {order.status}
                    </span>
                  </div>

                  {/* Main order information */}
                  <div className="admin-order-card-body">
                    <div className="admin-order-customer">
                      <span className="admin-order-label">CUSTOMER</span>
                      <strong>
                        {order.user?.name || order.user?.username || "Customer"}
                      </strong>
                      <span>{order.user?.email || "Email unavailable"}</span>
                    </div>

                    <div className="admin-order-items-summary">
                      <span className="admin-order-label">ITEMS</span>
                      <strong>
                        {order.items?.reduce(
                          (total, item) => total + Number(item.quantity || 0),
                          0
                        ) || 0}{" "}
                        books
                      </strong>
                      <span>
                        {order.items?.length || 0} different titles
                      </span>
                    </div>

                    <div className="admin-order-total">
                      <span className="admin-order-label">ORDER TOTAL</span>
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                  </div>

                  {/* Purchased books */}
                  <div className="admin-order-products">
                    <span className="admin-order-label">PURCHASED BOOKS</span>

                    <div className="admin-order-product-list">
                      {order.items?.map((item, index) => (
                        <div
                          className="admin-order-product"
                          key={item._id || `${order._id}-${index}`}
                        >
                          <div className="admin-order-product-cover">
                            {item.book?.image ? (
                              <img
                                src={
                                  item.book.image.startsWith("http")
                                    ? item.book.image
                                    : `/images/${item.book.image}`
                                }
                                alt={item.book?.title || "Purchased book"}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>BOOK</span>
                            )}
                          </div>

                          <div className="admin-order-product-details">
                            <strong>
                              {item.book?.title ||
                                item.title ||
                                "Book information unavailable"}
                            </strong>
                            <span>
                              Qty: {item.quantity} ×{" "}
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          <strong className="admin-order-product-total">
                            {formatPrice(
                              Number(item.price || 0) *
                                Number(item.quantity || 0)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order actions */}
                  <div className="admin-order-card-footer">
                    <button
                      type="button"
                      className="admin-order-details-button"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order._id)
                      }
                    >
                      {isExpanded ? "Hide Details" : "View Shipping Details"}
                      <span>{isExpanded ? "−" : "+"}</span>
                    </button>

                    <div className="admin-order-status-actions">
                      {availableStatuses.length > 0 ? (
                        <>
                          <span className="admin-order-label">
                            UPDATE STATUS
                          </span>

                          {availableStatuses.map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={isUpdating}
                              className={`admin-order-action-button ${
                                status === "Cancelled"
                                  ? "admin-order-cancel-button"
                                  : "admin-order-advance-button"
                              }`}
                              onClick={() =>
                                handleStatusUpdate(order._id, status)
                              }
                            >
                              {isUpdating
                                ? "Updating..."
                                : status === "Cancelled"
                                  ? "Cancel Order"
                                  : `Mark ${status}`}
                            </button>
                          ))}
                        </>
                      ) : (
                        <span className="admin-order-final-status">
                          {order.status === "Delivered"
                            ? "Order completed"
                            : "No further actions"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable shipping information */}
                  {isExpanded && (
                    <div className="admin-order-shipping">
                      <div className="admin-order-shipping-heading">
                        <span className="admin-order-shipping-icon">⌖</span>
                        <div>
                          <span className="admin-order-label">
                            DELIVERY INFORMATION
                          </span>
                          <h4>Shipping Address</h4>
                        </div>
                      </div>

                      {order.shippingAddress ? (
                        <div className="admin-order-address">
                          {typeof order.shippingAddress === "string" ? (
                            <p>{order.shippingAddress}</p>
                          ) : (
                            <>
                              {order.shippingAddress.fullName && (
                                <strong>
                                  {order.shippingAddress.fullName}
                                </strong>
                              )}
                              {[
                                order.shippingAddress.address,
                                order.shippingAddress.street,
                                order.shippingAddress.city,
                                order.shippingAddress.state,
                                order.shippingAddress.postalCode,
                                order.shippingAddress.zipCode,
                                order.shippingAddress.country,
                                order.shippingAddress.phone,
                              ]
                                .filter(Boolean)
                                .map((value, index) => (
                                  <p key={`${value}-${index}`}>{value}</p>
                                ))}
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="admin-order-no-address">
                          No shipping address available.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminOrders;
