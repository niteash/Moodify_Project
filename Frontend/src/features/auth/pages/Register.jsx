import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Formgroup from "../components/Formgroup";
import "../style/register.scss";
import { useAuth } from "../hooks/use.auth";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message,
      );

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Registration failed.",
      );
    }
  }

  return (
    <main className="register-page">
      <div className="form-container">
        <h1>Register Page</h1>

        <form className="register-form" onSubmit={handleSubmit}>
          <Formgroup
            name="username"
            type="text"
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <Formgroup
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Formgroup
            name="password"
            type="password"
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {errorMessage && (
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
