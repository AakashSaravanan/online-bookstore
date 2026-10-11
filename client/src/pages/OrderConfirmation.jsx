
import { Link, useLocation, Navigate } from "react-router-dom";

// Displays the order confirmation and safely handles missing details.
function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  // Redirect if no order information was provided
  if (!order) {
    return <Navigate to="/books" replace />;
  }

  const shippingAddress = order.shippingAddress;

  return (
    <div>
      <h1>Order Placed Successfully!</h1>
      <p>Thank you for your purchase.</p>

      <h2>Order Details</h2>
      <p>Order ID: {order._id}</p>
      <p>Status: {order.status}</p>

      <h2>Items</h2>

      {order.items?.map((item, index) => (
        <div key={item._id || index}>
          <p>Book ID: {item.book?._id || item.book}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price per book: ₹{item.price}</p>
          <p>Item total: ₹{item.price * item.quantity}</p>
        </div>
      ))}

      <h2>Total: ₹{order.totalAmount}</h2>

      <h2>Shipping Address</h2>

      {shippingAddress ? (
        <>
          <p>{shippingAddress.name}</p>
          <p>{shippingAddress.address}</p>
          <p>
            {shippingAddress.city}, {shippingAddress.state}
          </p>
          <p>Pincode: {shippingAddress.pincode}</p>
        </>
      ) : (
        <p>Shipping details are unavailable for this order.</p>
      )}

      <Link to="/books">Continue Shopping</Link>
    </div>
  );
}

export default OrderConfirmation;