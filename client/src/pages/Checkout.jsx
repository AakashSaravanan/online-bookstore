
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadCart, clearCart } from "../utils/cart";
import API_BASE_URL from "../api";

// Format prices using Indian currency formatting.
const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

// Displays checkout details and submits the order to the backend.
function Checkout() {
  const navigate = useNavigate();

  // Load the cart saved in the browser.
  const [cartItems] = useState(() => loadCart());

  // Store the customer's shipping information.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values when the user types.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // Calculate the displayed cart total.
  const orderTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total number of books.
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Validate and submit the order to the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (isSubmitting) return;

    if (!cartItems.length) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      setErrorMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    // Get the JWT saved during login.
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Please log in before placing your order.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send book IDs, quantities, and shipping details.
      // The backend calculates prices using MongoDB.
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            book: item._id,
            quantity: item.quantity,
          })),
          shippingAddress: formData,
        }),
      });

      const data = await response.json();

      // Display any error returned by the backend.
      if (!response.ok) {
        setErrorMessage(data.message || "Unable to place your order.");
        return;
      }

      // Clear the cart only after successful order creation.
      clearCart();

      // Navigate to the order confirmation page.
      navigate("/order-confirmation", {
        replace: true,
        state: { order: data.order },
      });
    } catch (error) {
      console.error("Place order error:", error);

      setErrorMessage(
        "Could not connect to the server. Please check your connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart screen.
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛍️</div>
          <h1>Your cart is empty</h1>
          <p>
            Looks like you haven't added any books to your cart yet.
            Discover your next great read!
          </p>
          <Link to="/books" className="checkout-primary-link">
            Explore Books
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        {/* Checkout heading */}
        <header className="checkout-header">
          <div className="checkout-breadcrumb">
            <Link to="/books">Home</Link>
            <span>/</span>
            <Link to="/cart">Cart</Link>
            <span>/</span>
            <span className="checkout-current-page">Checkout</span>
          </div>

          <h1>Complete Your Order</h1>

          <p>
            Just a few more details before your books arrive at your doorstep.
          </p>

          {/* Checkout progress */}
          <div className="checkout-progress">
            <div className="checkout-progress-step completed">
              <span className="checkout-step-number">✓</span>
              <span>Cart</span>
            </div>

            <div className="checkout-progress-line active"></div>

            <div className="checkout-progress-step active">
              <span className="checkout-step-number">2</span>
              <span>Checkout</span>
            </div>

            <div className="checkout-progress-line"></div>

            <div className="checkout-progress-step">
              <span className="checkout-step-number">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </header>

        {/* Main checkout layout */}
        <div className="checkout-layout">

          {/* Shipping information */}
          <section className="checkout-form-section">
            <div className="checkout-section-heading">
              <div className="checkout-heading-icon">01</div>

              <div>
                <h2>Shipping Information</h2>
                <p>Where should we deliver your books?</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-form-grid">

                <div className="checkout-input-group">
                  <label htmlFor="name">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="checkout-input-group">
                  <label htmlFor="email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="checkout-input-group full-width">
                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength={10}
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="checkout-input-group full-width">
                  <label htmlFor="address">
                    Street Address <span>*</span>
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    placeholder="House number, street name, area..."
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                    rows={3}
                    required
                  />
                </div>

                <div className="checkout-input-group">
                  <label htmlFor="city">
                    City <span>*</span>
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="checkout-input-group">
                  <label htmlFor="state">
                    State <span>*</span>
                  </label>

                  <input
                    id="state"
                    type="text"
                    name="state"
                    placeholder="Enter your state"
                    value={formData.state}
                    onChange={handleChange}
                    autoComplete="address-level1"
                    required
                  />
                </div>

                <div className="checkout-input-group">
                  <label htmlFor="pincode">
                    PIN Code <span>*</span>
                  </label>

                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    placeholder="6-digit PIN code"
                    value={formData.pincode}
                    onChange={handleChange}
                    autoComplete="postal-code"
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="checkout-error" role="alert">
                  <span>!</span>
                  {errorMessage}
                </div>
              )}

              <div className="checkout-form-footer">
                <Link to="/cart" className="checkout-back-link">
                  ← Back to Cart
                </Link>

                <button
                  type="submit"
                  className="checkout-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                  {!isSubmitting && <span>→</span>}
                </button>
              </div>
            </form>
          </section>

          {/* Order summary */}
          <aside className="checkout-summary">
            <div className="checkout-summary-header">
              <div>
                <h2>Order Summary</h2>
                <p>{totalItems} {totalItems === 1 ? "book" : "books"} in your order</p>
              </div>

              <span className="checkout-item-count">
                {cartItems.length}
              </span>
            </div>

            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div className="checkout-summary-item" key={item._id}>
                  <div className="checkout-book-image">
                    <img
                      src={`/images/${item.image}`}
                      alt={item.title}
                    />
                  </div>

                  <div className="checkout-book-info">
                    <h3>{item.title}</h3>

                    <p>Qty: {item.quantity}</p>

                    <span>
                      {formatPrice(item.price)} each
                    </span>
                  </div>

                  <div className="checkout-book-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-price-breakdown">
              <div className="checkout-price-row">
                <span>Subtotal</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>

              <div className="checkout-price-row checkout-total-row">
                <span>Total Amount</span>
                <strong>{formatPrice(orderTotal)}</strong>
              </div>
            </div>

            <div className="checkout-summary-note">
              <span>✓</span>
              <p>
                Your order details will be confirmed after successful order placement.
              </p>
            </div>

            <Link to="/cart" className="checkout-edit-cart">
              ← Edit your cart
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
