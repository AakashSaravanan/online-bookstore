import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCart, saveCart } from "../utils/cart";

function Cart() {
  // Load the saved cart when the component first renders.
  const [cartItems, setCartItems] = useState(() => loadCart());

  // Save every cart update to localStorage.
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  // Increase quantity without exceeding available stock.
  const increaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, item.stock),
            }
          : item
      )
    );
  };

  // Decrease quantity, keeping the minimum at one.
  const decreaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  // Remove a book from the cart.
  const removeItem = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== id)
    );
  };

  // Calculate the total number of books.
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate the total cart value.
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <p className="section-eyebrow">YOUR SELECTION</p>
        <h1>Shopping <span>Cart</span></h1>
        <p>Review your books before moving to checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon" aria-hidden="true">
            <span>0</span>
          </div>
          <h2>Your bookshelf is waiting.</h2>
          <p>
            Your shopping cart is currently empty.
            Discover something you'll love reading.
          </p>
          <Link to="/books" className="cart-primary-button">
            Explore Books <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-section">
            <div className="cart-items-heading">
              <h2>Your Items</h2>
              <span>
                {totalQuantity} {totalQuantity === 1 ? "book" : "books"}
              </span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <article className="cart-item" key={item._id}>
                  <div className="cart-item-image-container">
                    {item.image ? (
                      <img
                        src={`/images/${item.image}`}
                        alt={item.title}
                        className="cart-item-image"
                      />
                    ) : (
                      <div className="cart-item-image-placeholder">
                        BOOK
                      </div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <span className="cart-item-category">
                      {item.category}
                    </span>

                    <h3>{item.title}</h3>
                    <p className="cart-item-author">by {item.author}</p>

                    <p className="cart-item-unit-price">
                      ₹{item.price} <span>/ book</span>
                    </p>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.title}`}
                          disabled={item.quantity <= 1}
                          onClick={() => decreaseQuantity(item._id)}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.title}`}
                          disabled={item.quantity >= item.stock}
                          onClick={() => increaseQuantity(item._id)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => removeItem(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <span>Item Total</span>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                </article>
              ))}
            </div>

            <Link to="/books" className="cart-continue-link">
              <span aria-hidden="true">←</span> Continue Shopping
            </Link>
          </section>

          <aside className="cart-summary">
            <p className="cart-summary-eyebrow">ORDER OVERVIEW</p>
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Books ({totalQuantity})</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <div className="cart-summary-row">
              <span>Shipping</span>
              <strong>Calculated at checkout</strong>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Subtotal</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <p className="cart-summary-note">
              Final order details and any applicable charges will be
              shown during checkout.
            </p>

            <Link to="/checkout" className="cart-checkout-button">
              Proceed to Checkout <span aria-hidden="true">→</span>
            </Link>

            <div className="cart-security-note">
              <span aria-hidden="true">✓</span>
              Your cart is saved automatically.
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;