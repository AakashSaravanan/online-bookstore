
/**
 * Helpers for storing each logged-in user's cart separately.
 * The backend still verifies the user's JWT when an order is placed.
 */

// Read the user ID from the JWT saved during login.
export function getCurrentCartKey() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // Convert Base64URL to Base64 and restore padding.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));

    return decoded.userId ? `cart_${decoded.userId}` : null;
  } catch {
    return null;
  }
}

// Load only the cart belonging to the currently logged-in user.
export function loadCart() {
  // Discard the old shared cart so accounts cannot inherit it.
  localStorage.removeItem("cart");

  const key = getCurrentCartKey();
  if (!key) return [];

  try {
    const savedCart = localStorage.getItem(key);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}

// Save changes only to the current user's cart.
export function saveCart(items) {
  localStorage.removeItem("cart");

  const key = getCurrentCartKey();
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(items));
}

// Clear only the current user's cart after a successful order.
export function clearCart() {
  localStorage.removeItem("cart");

  const key = getCurrentCartKey();
  if (key) localStorage.removeItem(key);
}
