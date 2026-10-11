import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [userRole, setUserRole] = useState(getUserRole);

  // Refresh login and role information when the route changes.
  useEffect(() => {
    const token = localStorage.getItem("token");

    setIsLoggedIn(!!token);
    setUserRole(getUserRole());
  }, [location.pathname]);

  // Remove the token and return to the homepage.
  const handleLogout = () => {
    localStorage.removeItem("token");
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