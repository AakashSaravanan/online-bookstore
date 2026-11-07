
import { useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setMessage("Your account has been created successfully!");
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
              <p className="auth-eyebrow">A WORLD OF STORIES AWAITS</p>
              <h1>Every great journey begins with a book.</h1>
              <p className="auth-brand-description">
                Join our reading community and discover stories,
                knowledge, and inspiration waiting to be explored.
              </p>
            </div>

            <div className="auth-brand-footer">
              Turn the page. Begin something new.
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-wrapper">

            <p className="auth-form-eyebrow">JOIN BOOKSHELF</p>
            <h2>Create your account</h2>
            <p className="auth-subtitle">
              Sign up and start discovering your next favourite book.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>

              <div className="auth-field">
                <label htmlFor="register-name">Full name</label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-password">Password</label>

                <div className="auth-password-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
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
                <p
                  className={`auth-message ${
                    success ? "auth-success" : "auth-error"
                  }`}
                  role="status"
                >
                  {message}
                </p>
              )}

              {success ? (
                <Link to="/login" className="auth-submit-btn auth-login-link">
                  Continue to Login
                </Link>
              ) : (
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              )}

            </form>

            <p className="auth-switch">
              Already have an account?
              <Link to="/login"> Sign in</Link>
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

export default Register;
