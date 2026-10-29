import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Formgroup from "../components/Formgroup";
import "../style/login.scss";
import { useAuth } from "../hooks/use.auth";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials.",
      );
    }
  }

  return (
    <main className="login-page">
      <div className="form-container">
        <h1>Login Page</h1>

        <form className="login-form" onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {errorMessage && (
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
