import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Read the user's role from the JWT token.
function getUserRole() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(atob(base64));

    return decoded.role || null;
  } catch {
    return null;
  }
}

function Navbar() {
  // Keep authentication status in React state.
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );

  // Update the Navbar whenever login or logout occurs.
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("authChange", syncAuth);

    return () => {
      window.removeEventListener("authChange", syncAuth);
    };
  }, []);
  const userRole = getUserRole();

  // Remove the token and notify the Navbar.
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  return (
    <nav>
      <h2>Online Bookstore</h2>

      <div>
        <Link to="/">Home</Link>{" "}
        <Link to="/books">Books</Link>{" "}
        <Link to="/cart">Cart</Link>{" "}

        {isLoggedIn ? (
          <>

            <Link to="/my-orders">My Orders</Link>{" "}

            {userRole === "admin" && (
              <Link to="/admin">Admin</Link>
            )}

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>{" "}
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;