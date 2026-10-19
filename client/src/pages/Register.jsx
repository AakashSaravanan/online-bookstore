import { useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";

// Register page for new users

function Register() {
    // Store the name entered by the user
  const [name, setName] = useState("");

  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Store the password entered by the user
  const [password, setPassword] = useState("");

  // Store a message to show after registration
  const [message, setMessage] = useState("");

  // Handle the registration form submission
  const handleSubmit = async (event) => {
  // Prevent the browser from refreshing the page
  event.preventDefault();

    // Send the registration details to the backend
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: name,
        email: email,
        password: password,
    }),
 });

 // Convert the backend response from JSON into a JavaScript object
 const data = await response.json();

 // Check whether the backend accepted the registration
 if (!response.ok) {
   setMessage(data.message);
   return;
 }

 // Show a message after successful registration
 setMessage("Registration successful!");

};

  return (
    <div className="register-page">
      <h1>Register</h1>

      {/* Registration form fields */}
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Name input */}
        <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        />

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

        {/* Register button */}
        <button>Register</button>
      </form>
      {/* Show the registration message when one exists */}
      {message && <p>{message}</p>}
      <p>
        Already have an account?{" "}
        <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;