import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  // Load existing cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Increase quantity
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

  // Decrease quantity
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

  // Remove item
  const removeItem = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== id)
    );
  };

  // Calculate total price
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h1>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div>
          <p>Your cart is currently empty.</p>
          <Link to="/books">Continue Shopping</Link>
        </div>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item._id}>
              <h2>{item.title}</h2>
              <p>Author: {item.author}</p>
              <p>Price: ₹{item.price}</p>
              <p>Category: {item.category}</p>
              <p>Stock: {item.stock}</p>
              <p>Item Total: ₹{item.price * item.quantity}</p>

              <div>
                <p>Quantity: {item.quantity}</p>

                <button onClick={() => decreaseQuantity(item._id)}>
                  -
                </button>

                <button
                  disabled={item.quantity >= item.stock}
                  onClick={() => increaseQuantity(item._id)}
                >
                  +
                </button>
              </div>

              <button onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </div>
          ))}

          <h2>Cart Total: ₹{cartTotal}</h2>

          <div>
            <Link to="/books">Continue Shopping</Link>{" "}
            <Link to="/checkout">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;