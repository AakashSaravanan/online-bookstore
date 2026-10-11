import { Navigate } from "react-router-dom";

// Decode the user's role from the JWT token.
function getUserRole(token) {
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

// Protects pages that require login or admin access.
function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  // Require login for all protected pages.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole(token);

  // Redirect non-admin users away from admin-only pages.
  if (adminOnly && role !== "admin") {
    return <Navigate to="/books" replace />;
  }

  return children;
}

export default ProtectedRoute;