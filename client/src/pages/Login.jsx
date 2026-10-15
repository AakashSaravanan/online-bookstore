import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Login page for existing users

function Login() {

  const navigate = useNavigate();
  const location = useLocation();
  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Store the password entered by the user
  const [password, setPassword] = useState("");

    // Store a message to show after login
  const [message, setMessage] = useState("");

    // Handle the login form submission
  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page
    event.preventDefault();

    // Send the login details to the backend
    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    });


    // Convert the backend response from JSON into a JavaScript object
    const data = await response.json();

    // Check whether the backend accepted the login
    if (!response.ok) {
    setMessage(data.message);
    return;
    }

    // Save the JWT token in the browser
    localStorage.setItem("token", data.token);

    // Show a message after successful login
    setMessage("Login successful!");
    
    // Reload the app so the Navbar detects the new token
    navigate(location.state?.from || "/", { replace: true });
  };
  return (
    <div className="login-page">
        <h1>Login</h1>

        <form className="login-form" onSubmit={handleSubmit}>
        {/* Email input */}
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
        />

        {/* Password input */}
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
        />

        {/* Login button */}
        <button>Login</button>
        </form>

        {/* Show the login message when one exists */}
        {message && <p>{message}</p>}
        {/* Link to the registration page */}
        <p>
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
        </p>
    </div>
    );
}

export default Login;