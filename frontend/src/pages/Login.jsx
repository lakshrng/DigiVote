import React from "react";
import "./login.css";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>DigiVote Login</h1>
        <p>Access your secure voting account</p>

        <form>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" required />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="signup-text">
          Don’t have an account? <a href="#">Register here</a>
        </p>
      </div>
    </div>
  );
}
