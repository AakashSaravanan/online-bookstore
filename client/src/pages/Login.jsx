
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("authChange"));

      navigate(location.state?.from || "/", { replace: true });
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <Link to="/" className="auth-brand-logo">
              BOOKSHELF<span>.</span>
            </Link>

            <div>
              <p className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
              <h1>Welcome back to your world of stories.</h1>
              <p className="auth-brand-description">
                Discover new perspectives, revisit timeless classics,
                and find the books that stay with you.
              </p>
            </div>

            <div className="auth-brand-footer">
              A good book is a journey worth taking.
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-wrapper">

            <p className="auth-form-eyebrow">WELCOME BACK</p>
            <h2>Sign in to your account</h2>
            <p className="auth-subtitle">
              Enter your details to continue exploring.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>

              <div className="auth-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>

                <div className="auth-password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {message && (
                <p className="auth-message auth-error" role="alert">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <p className="auth-switch">
              Don't have an account?
              <Link to="/register"> Create an account</Link>
            </p>

            <Link to="/books" className="auth-back-link">
              ← Back to exploring books
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
