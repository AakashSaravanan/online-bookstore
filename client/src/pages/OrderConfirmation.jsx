
import { Link, useLocation, Navigate } from "react-router-dom";

// Format prices using Indian currency formatting.
const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

// Displays the order confirmation and safely handles missing details.
function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  // Redirect if no order information was provided.
  if (!order) {
    return <Navigate to="/books" replace />;
  }

  const shippingAddress = order.shippingAddress;
  const items = order.items || [];

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const getStatusClass = (status) => {
    const normalizedStatus = (status || "").toLowerCase();

    if (normalizedStatus === "delivered") return "delivered";
    if (normalizedStatus === "cancelled") return "cancelled";

    return "processing";
  };

  return (
    <main className="confirmation-page">
      <div className="confirmation-container">

        {/* Success message */}
        <section className="confirmation-success">
          <div className="confirmation-success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <span className="confirmation-eyebrow">
            ORDER CONFIRMED
          </span>

          <h1>
            Thank You for <span>Your Order!</span>
          </h1>

          <p>
            Your order has been placed successfully.
            We appreciate your purchase and hope you enjoy your new reads.
          </p>
        </section>

        {/* Order information */}
        <section className="confirmation-order-info">
          <div className="confirmation-info-item">
            <span>ORDER REFERENCE</span>
            <strong>{order._id}</strong>
          </div>

          {orderDate && (
            <div className="confirmation-info-item">
              <span>ORDER DATE</span>
              <strong>{orderDate}</strong>
            </div>
          )}

          <div className="confirmation-info-item">
            <span>ORDER STATUS</span>
            <strong
              className={`confirmation-status ${getStatusClass(order.status)}`}
            >
              {order.status || "Processing"}
            </strong>
          </div>
        </section>

        {/* Order details */}
        <div className="confirmation-content">

          {/* Purchased books */}
          <section className="confirmation-card confirmation-items-card">
            <div className="confirmation-card-heading">
              <div>
                <h2>Your Order</h2>
                <p>
                  {totalItems} {totalItems === 1 ? "book" : "books"} purchased
                </p>
              </div>

              <span className="confirmation-count">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="confirmation-items">
              {items.map((item, index) => {
                // The book may be populated or may only contain its ID.
                const book =
                  item.book && typeof item.book === "object"
                    ? item.book
                    : null;

                return (
                  <div
                    className="confirmation-book"
                    key={item._id || index}
                  >
                    <div className="confirmation-book-image">
                      {book?.image ? (
                        <img
                          src={`/images/${book.image}`}
                          alt={book.title || "Book cover"}
                        />
                      ) : (
                        <div className="confirmation-book-placeholder">
                          <span>BOOK</span>
                        </div>
                      )}
                    </div>

                    <div className="confirmation-book-details">
                      <h3>{book?.title || "Purchased Book"}</h3>

                      {book?.author && (
                        <p className="confirmation-book-author">
                          by {book.author}
                        </p>
                      )}

                      <p className="confirmation-book-quantity">
                        Quantity: {item.quantity}
                      </p>

                      <span>
                        {formatPrice(item.price)} per book
                      </span>
                    </div>

                    <strong className="confirmation-book-total">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="confirmation-total">
              <span>Total Amount</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </section>

          {/* Shipping information */}
          <section className="confirmation-card confirmation-shipping-card">
            <div className="confirmation-card-heading">
              <div>
                <h2>Delivery Address</h2>
                <p>Your order will be delivered to</p>
              </div>

              <div className="confirmation-address-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>
            </div>

            {shippingAddress ? (
              <div className="confirmation-address">
                <strong>{shippingAddress.name}</strong>

                <p>{shippingAddress.address}</p>

                <p>
                  {shippingAddress.city}, {shippingAddress.state}
                </p>

                <p>PIN Code: {shippingAddress.pincode}</p>

                {shippingAddress.phone && (
                  <p>Phone: {shippingAddress.phone}</p>
                )}

                {shippingAddress.email && (
                  <p>Email: {shippingAddress.email}</p>
                )}
              </div>
            ) : (
              <p className="confirmation-unavailable">
                Shipping details are unavailable for this order.
              </p>
            )}
          </section>
        </div>

        {/* Bottom message and navigation */}
        <section className="confirmation-footer">
          <div>
            <h3>Happy Reading!</h3>
            <p>
              Every great book opens the door to a new adventure.
              Thank you for choosing our bookstore.
            </p>
          </div>

          <Link to="/books" className="confirmation-shop-btn">
            Continue Shopping
            <span>→</span>
          </Link>
        </section>

      </div>
    </main>
  );
}

export default OrderConfirmation;
