
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Displays checkout details and submits the order to the backend.
function Checkout() {
  const navigate = useNavigate();

  // Load the cart saved in the browser
  const [cartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Store the customer's shipping information
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

  // Update the form when the user types
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // Calculate the displayed cart total
  const orderTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Validate and submit the order to the backend
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

    // Get the JWT saved during login
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Please log in before placing your order.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send book IDs, quantities, and shipping details to the API.
      // The backend calculates prices using MongoDB.
      const response = await fetch("http://localhost:5000/api/orders", {
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

      // Display any error returned by the backend
      if (!response.ok) {
        setErrorMessage(data.message || "Unable to place your order.");
        return;
      }

      // Clear the cart only after the backend confirms success
      localStorage.removeItem("cart");

      // Open the confirmation page with the saved order
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

  return (
    <div>
      <h1>Checkout</h1>

      {cartItems.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/books">Continue Shopping</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Shipping Details</h2>

          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item._id}>
              <p>
                {item.title} × {item.quantity}
              </p>
              <p>₹{item.price * item.quantity}</p>
            </div>
          ))}

          <h2>Total: ₹{orderTotal}</h2>

          {errorMessage && (
            <p role="alert" style={{ color: "red" }}>
              {errorMessage}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      )}
    </div>
  );
}

export default Checkout;